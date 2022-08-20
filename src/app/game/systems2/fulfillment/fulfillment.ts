import { EcsPlugin, PluginApp } from "@/app/ecs";
import {
  All,
  ChildrenIterable,
  MapQuery,
  DiffMut,
  Query,
  Read,
  Value,
  With,
  Parent,
  Opt,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaRecorder } from "../types";

import * as F from "../types/fulfillments";
import * as R from "../types/resources";

const Q_Id = Value(F.Id);
const Q_ParentId = Parent(Q_Id);
const Q_IngredientId = Value(F.Ingredient);
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

const CalculateFulfillment = System(
  Query(Q_IngredientId, Value(F.Requirement), Q_FulfillmentMut, Q_CappedMut),
  Query(
    Q_FulfillmentMut,
    Q_CappedMut,
    ChildrenIterable(Read(F.Fulfillment), Value(F.Capped)),
  ).filter(With(F.Id)),
  MapQuery(Value(R.Id), All(Value(R.Amount), Opt(Value(R.Capacity)))),
)((ingredientsQuery, fulfillmentsQuery, resourceQuery) => {
  const map = resourceQuery.map();
  for (const [
    resource,
    requirement,
    fulfillment,
    capped,
  ] of ingredientsQuery.all()) {
    const [amount, capacity] = map.get(resource)!;
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

  for (const [
    mainFulfillment,
    mainCapped,
    ingredients,
  ] of fulfillmentsQuery.all()) {
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
    Q_IngredientId,
    Q_ParentId,
  )((root, { value: requirement }, [resource, [id]]) => {
    const target = root.fulfillments[id].ingredients[resource]!;
    target.requirement = requirement;
  }),
  DeltaRecorder(
    F.Fulfillment,
    Q_IngredientId,
    Q_ParentId,
  )((root, { fulfilled, eta }, [resource, [id]]) => {
    const target = root.fulfillments[id].ingredients[resource]!;
    target.fulfilled = fulfilled;
    target.eta = eta;
  }),
  DeltaRecorder(
    F.Capped,
    Q_IngredientId,
    Q_ParentId,
  )((root, { value: capped }, [resource, [id]]) => {
    const target = root.fulfillments[id].ingredients[resource]!;
    target.capped = capped;
  }),
  DeltaRecorder(
    F.Fulfillment,
    Q_Id,
  )((root, { fulfilled }, [id]) => {
    root.fulfillments[id].fulfilled = fulfilled;
  }),
  DeltaRecorder(
    F.Capped,
    Q_Id,
  )((root, { value: capped }, [id]) => {
    root.fulfillments[id].capped = capped;
  }),
];

export class FulfillmentResolutionPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addSystem(CalculateFulfillment)
      .addSystems(DeltaRecorders, { stage: "last-start" });
  }
}
