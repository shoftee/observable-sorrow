import { Meta, resourceQtyIterable } from "@/app/state";

import { EcsPlugin, PluginApp } from "@/app/ecs";
import {
  Tuple,
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

const Q_ParentFulfillment = ParentQuery(Value(Fulfillment));

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

const CalculateIngredientFulfillment = System(
  Query(
    Value(Resource),
    Value(F.Requirement),
    DiffMut(F.Progress),
    DiffMut(F.Capped),
  ),
  MapQuery(
    Value(Resource),
    Tuple(Value(R.Amount), Opt(Value(R.Delta)), Opt(Value(R.Limit))),
  ),
)((ingredients, resources) => {
  for (const [resource, requirement, progress, capped] of ingredients) {
    const [amount, delta, limit] = resources.get(resource)!;

    progress.fulfilled = amount >= requirement;
    if (amount < requirement && delta !== undefined && delta > 0) {
      if (limit !== undefined && limit < requirement) {
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
      !progress.fulfilled && limit !== undefined && requirement > limit;
  }
});

const CalculateRecipeFulfillment = System(
  Query(
    DiffMut(F.Progress),
    DiffMut(F.Capped),
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
  Value(Resource),
)((schema, [[fulfillment], resource]) => {
  return schema.fulfillments[fulfillment].ingredients[resource]!;
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
