import { Meta, resourceQtyIterable } from "@/app/state";

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

import { DeltaExtractor } from "../core";
import { Fulfillment, Resource } from "../types/common";
import { Unlocked } from "../unlock/types";
import * as R from "../resource/types";
import * as F from "./types";

const Q_Fulfillment = Value(Fulfillment);
const Q_Resource = Value(Resource);
const Q_ParentFulfillment = ParentQuery(Q_Fulfillment);
const Q_ProgressMut = DiffMut(F.Progress);
const Q_CappedMut = DiffMut(F.Capped);

const SpawnFulfillments = System(Commands())((cmds) => {
  for (const meta of Meta.recipes()) {
    cmds.spawn(...F.fulfillmentComponents(meta.id)).defer((e) => {
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

// TODO: support for multi-level recipes
// const CalculateRecipeRequirements = System(
//   MapQuery(
//     Entity(),
//     All(ChangeTrackers(F.Requirement), DiffMut(F.Requirement), Children()),
//   ),
// )((query) => { });

const CalculateIngredientFulfillment = System(
  Query(Q_Resource, Value(F.Requirement), Q_ProgressMut, Q_CappedMut),
  MapQuery(
    Q_Resource,
    All(Value(R.Amount), Opt(Value(R.Delta)), Opt(Value(R.Capacity))),
  ),
)((ingredients, resources) => {
  for (const [resource, requirement, progress, capped] of ingredients) {
    const [amount, delta, capacity] = resources.get(resource)!;

    progress.fulfilled = amount >= requirement;
    if (amount < requirement && delta !== undefined && delta > 0) {
      if (capacity !== undefined && capacity < requirement) {
        // requirement won't be fulfilled
        progress.eta = Number.POSITIVE_INFINITY;
      } else {
        progress.eta = (requirement - amount) / delta;
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
)((fulfillments) => {
  for (const [
    fulfillmentProgress,
    fulfillmentCapped,
    ingredients,
  ] of fulfillments) {
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

    fulfillmentProgress.fulfilled = allFulfilled;
    // if the whole thing is fulfilled, it's automatically non-capped
    // this is done to handle overcapped resources correctly
    fulfillmentCapped.value = !allFulfilled && anyCapped;
  }
});

const IngredientExtractor = DeltaExtractor(
  Q_ParentFulfillment,
  Q_Resource,
)((schema, [fulfillment, resource]) => {
  const [id] = fulfillment!;
  return schema.fulfillments[id].ingredients[resource]!;
});

const FulfillmentExtractor = DeltaExtractor(Value(Fulfillment))(
  (schema, [id]) => schema.fulfillments[id],
);

const Extractors = [
  IngredientExtractor(F.Requirement, (ingredient, { value: requirement }) => {
    ingredient.requirement = requirement;
  }),
  IngredientExtractor(F.Progress, (ingredient, { fulfilled, eta }) => {
    ingredient.fulfilled = fulfilled;
    ingredient.eta = eta;
  }),
  IngredientExtractor(F.Capped, (ingredient, { value: capped }) => {
    ingredient.capped = capped;
  }),
  FulfillmentExtractor(F.Progress, (fulfillment, { fulfilled }) => {
    fulfillment.fulfilled = fulfilled;
  }),
  FulfillmentExtractor(F.Capped, (fulfillment, { value: capped }) => {
    fulfillment.capped = capped;
  }),
  FulfillmentExtractor(Unlocked, (fulfillment, { value: unlocked }) => {
    fulfillment.unlocked = unlocked;
  }),
];

export class FulfillmentResolutionPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addSystems([CalculateIngredientFulfillment, CalculateRecipeFulfillment])
      .addSystems(Extractors, { stage: "last-start" });
  }
}
