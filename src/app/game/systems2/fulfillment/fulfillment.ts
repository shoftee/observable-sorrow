import { cache } from "@/app/utils/collections";

import { EcsPlugin, PluginApp } from "@/app/ecs";
import {
  All,
  ChildrenQuery,
  MapQuery,
  DiffMut,
  Query,
  Read,
  Value,
  ParentQuery,
  Opt,
  Eager,
  Commands,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaRecorder, Fulfillment, Resource, Unlocked } from "../types";
import * as F from "./types";
import * as R from "../resource/types";
import { Meta, resourceQtyIterable } from "@/app/state";

const Q_Fulfillment = Value(Fulfillment);
const Q_Resource = Value(Resource);
const Q_ParentFulfillment = ParentQuery(Q_Fulfillment);
const Q_ProgressMut = DiffMut(F.Progress);
const Q_CappedMut = DiffMut(F.Capped);

const SpawnFulfillments = System(Commands())((cmds) => {
  for (const meta of Meta.recipes()) {
    cmds.spawn(...F.fulfillmentComponents(meta.id)).entity((e) => {
      for (const [id, requirement] of resourceQtyIterable(meta.ingredients)) {
        cmds.spawnChild(e, ...F.ingredientComponents(id, requirement));
      }
    });
  }
});

export class FulfillmentSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addStartupSystem(SpawnFulfillments);
  }
}

const CalculateIngredientFulfillment = System(
  Query(Q_Resource, Value(F.Requirement), Q_ProgressMut, Q_CappedMut),
  MapQuery(Q_Resource, All(Value(R.Amount), Opt(Value(R.Capacity)))),
)((ingredientsQuery, resourcesQuery) => {
  const resources = cache(() => resourcesQuery.map());
  for (const [
    resource,
    requirement,
    progress,
    capped,
  ] of ingredientsQuery.all()) {
    const [amount, capacity] = resources.retrieve().get(resource)!;
    const change = 0; // TODO: need to add this to resources

    progress.fulfilled = amount >= requirement;
    if (amount < requirement && change > 0) {
      if (capacity !== undefined && capacity < requirement) {
        // requirement won't be fulfilled
        progress.eta = Number.POSITIVE_INFINITY;
      } else {
        progress.eta = (requirement - amount) / change;
      }
    } else {
      progress.eta = undefined;
    }

    // if the ingredient is fulfilled, it's automatically non-capped
    // this is done to handle overcapped resources correctly
    capped.value =
      !progress.fulfilled && capacity !== undefined && requirement > capacity;
  }
});

const CalculateRecipeFulfillment = System(
  Query(
    Q_ProgressMut,
    Q_CappedMut,
    Eager(ChildrenQuery(Read(F.Progress), Value(F.Capped))),
  ),
)((query) => {
  for (const [mainProgress, mainCapped, ingredients] of query.all()) {
    // this logic only applies to 'composite' fulfillments
    // skip it when they have no ingredients
    if (ingredients.length === 0) {
      continue;
    }

    let allFulfilled = true;
    let anyCapped = false;

    for (const [{ fulfilled }, capped] of ingredients) {
      allFulfilled &&= fulfilled;
      anyCapped ||= capped;
    }

    mainProgress.fulfilled = allFulfilled;
    // if the whole thing is fulfilled, it's automatically non-capped
    // this is done to handle overcapped resources correctly
    mainCapped.value = !allFulfilled && anyCapped;
  }
});

const DeltaRecorders = [
  DeltaRecorder(
    F.Requirement,
    Q_Resource,
    Q_ParentFulfillment,
  )((root, { value: requirement }, [resource, [id]]) => {
    const target = root.fulfillments[id].ingredients[resource]!;
    target.requirement = requirement;
  }),
  DeltaRecorder(
    F.Progress,
    Q_Resource,
    Q_ParentFulfillment,
  )((root, { fulfilled, eta }, [resource, [id]]) => {
    const target = root.fulfillments[id].ingredients[resource]!;
    target.fulfilled = fulfilled;
    target.eta = eta;
  }),
  DeltaRecorder(
    F.Capped,
    Q_Resource,
    Q_ParentFulfillment,
  )((root, { value: capped }, [resource, [id]]) => {
    const target = root.fulfillments[id].ingredients[resource]!;
    target.capped = capped;
  }),
  DeltaRecorder(
    F.Progress,
    Q_Fulfillment,
  )((root, { fulfilled }, [id]) => {
    root.fulfillments[id].fulfilled = fulfilled;
  }),
  DeltaRecorder(
    F.Capped,
    Q_Fulfillment,
  )((root, { value: capped }, [id]) => {
    root.fulfillments[id].capped = capped;
  }),
  DeltaRecorder(
    Unlocked,
    Q_Fulfillment,
  )((root, { value: unlocked }, [id]) => {
    root.fulfillments[id].unlocked = unlocked;
  }),
];

export class FulfillmentResolutionPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addSystems([CalculateIngredientFulfillment, CalculateRecipeFulfillment])
      .addSystems(DeltaRecorders, { stage: "last-start" });
  }
}
