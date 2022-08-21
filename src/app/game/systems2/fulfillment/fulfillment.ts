import { EcsPlugin, PluginApp } from "@/app/ecs";
import {
  All,
  ChildrenQuery,
  MapQuery,
  DiffMut,
  Query,
  Read,
  Value,
  With,
  ParentQuery,
  Opt,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaRecorder } from "../types";

import * as F from "./types";
import * as R from "../resource/types";
import { cache } from "@/app/utils/collections";

const Q_Recipe = Value(F.Recipe);
const Q_ParentRecipe = ParentQuery(Q_Recipe);
const Q_Resource = Value(F.Resource);
const Q_FulfillmentMut = DiffMut(F.Fulfillment);
const Q_CappedMut = DiffMut(F.Capped);

function calculateEta(
  amount: number,
  requirement: number,
  change: number,
  capacity?: number,
) {
  if (amount < requirement && change > 0) {
    if (capacity !== undefined && capacity < requirement) {
      // requirement won't be fulfilled
      return Number.POSITIVE_INFINITY;
    } else {
      return (requirement - amount) / change;
    }
  }
  return undefined;
}

const CalculateIngredientFulfillment = System(
  Query(Q_Resource, Value(F.Requirement), Q_FulfillmentMut, Q_CappedMut),
  MapQuery(Value(R.Id), All(Value(R.Amount), Opt(Value(R.Capacity)))),
)((ingredientsQuery, resourcesQuery) => {
  const resources = cache(() => resourcesQuery.map());
  for (const [
    resource,
    requirement,
    fulfillment,
    capped,
  ] of ingredientsQuery.all()) {
    const [amount, capacity] = resources.retrieve().get(resource)!;
    const change = 0; // TODO: need to add this to resources

    fulfillment.fulfilled = amount >= requirement;
    fulfillment.eta = calculateEta(amount, requirement, change, capacity);

    // if the ingredient is fulfilled, it's automatically non-capped
    // this is done to handle overcapped resources correctly
    capped.value =
      !fulfillment.fulfilled &&
      capacity !== undefined &&
      requirement > capacity;
  }
});

const CalculateRecipeFulfillment = System(
  Query(
    Q_FulfillmentMut,
    Q_CappedMut,
    ChildrenQuery(Read(F.Fulfillment), Value(F.Capped)),
  ).filter(With(F.Recipe)),
)((query) => {
  for (const [mainFulfillment, mainCapped, ingredients] of query.all()) {
    let allFulfilled = true;
    let anyCapped = false;

    for (const [{ fulfilled }, capped] of ingredients) {
      allFulfilled &&= fulfilled;
      anyCapped ||= capped;
    }

    mainFulfillment.fulfilled = allFulfilled;

    // if the whole thing is fulfilled, it's automatically non-capped
    // this is done to handle overcapped resources correctly
    mainCapped.value = !allFulfilled && anyCapped;
  }
});

const DeltaRecorders = [
  DeltaRecorder(
    F.Requirement,
    Q_Resource,
    Q_ParentRecipe,
  )((root, { value: requirement }, [resource, [id]]) => {
    const target = root.fulfillments[id].ingredients[resource]!;
    target.requirement = requirement;
  }),
  DeltaRecorder(
    F.Fulfillment,
    Q_Resource,
    Q_ParentRecipe,
  )((root, { fulfilled, eta }, [resource, [id]]) => {
    const target = root.fulfillments[id].ingredients[resource]!;
    target.fulfilled = fulfilled;
    target.eta = eta;
  }),
  DeltaRecorder(
    F.Capped,
    Q_Resource,
    Q_ParentRecipe,
  )((root, { value: capped }, [resource, [id]]) => {
    const target = root.fulfillments[id].ingredients[resource]!;
    target.capped = capped;
  }),
  DeltaRecorder(
    F.Fulfillment,
    Q_Recipe,
  )((root, { fulfilled }, [id]) => {
    root.fulfillments[id].fulfilled = fulfilled;
  }),
  DeltaRecorder(
    F.Capped,
    Q_Recipe,
  )((root, { value: capped }, [id]) => {
    root.fulfillments[id].capped = capped;
  }),
];

export class FulfillmentResolutionPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addSystems([CalculateIngredientFulfillment, CalculateRecipeFulfillment])
      .addSystems(DeltaRecorders, { stage: "last-start" });
  }
}
