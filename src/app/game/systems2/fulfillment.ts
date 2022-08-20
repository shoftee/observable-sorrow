import { EcsPlugin, PluginApp } from "@/app/ecs";
import {
  All,
  ChildrenIterable,
  Commands,
  MapQuery,
  DiffMut,
  Query,
  Read,
  Value,
  With,
  Parent,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { ResourceId } from "@/app/interfaces";
import { Meta } from "@/app/state";
import { DeltaRecorder } from "./types";

import * as F from "./types/fulfillments";
import * as R from "./types/resources";

const SpawnFulfillments = System(Commands())((cmds) => {
  for (const meta of Meta.recipes()) {
    cmds
      .spawn(new F.Id(meta.id), new F.Fulfillment(), new F.Capped(false))
      .asParent((parent) => {
        for (const [id, requirement] of Object.entries(meta.ingredients)) {
          cmds.spawnChild(
            parent,
            new F.Ingredient(id as ResourceId),
            new F.Requirement(requirement),
            new F.Fulfillment(),
            new F.Capped(false),
          );
        }
      });
  }
});

const CalculateFulfillment = System(
  Query(
    Value(F.Ingredient),
    Value(F.Requirement),
    DiffMut(F.Fulfillment),
    DiffMut(F.Capped),
  ),
  Query(
    DiffMut(F.Fulfillment),
    DiffMut(F.Capped),
    ChildrenIterable(Read(F.Fulfillment), Value(F.Capped)),
  ).filter(With(F.Id)),
  MapQuery(Value(R.Id), All(Value(R.Amount), Value(R.Capacity))),
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
    fulfillment.eta = (() => {
      if (amount < requirement && change > 0) {
        if (capacity !== undefined && capacity < requirement) {
          // requirement won't be fulfilled
          return Number.POSITIVE_INFINITY;
        } else {
          return (requirement - amount) / change;
        }
      }
      return undefined;
    })();

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
    for (const [fulfillment, capped] of ingredients) {
      allFulfilled &&= fulfillment.fulfilled;
      anyCapped ||= capped;
    }

    mainFulfillment.fulfilled = allFulfilled;

    // if the whole thing is fulfilled, it's automatically non-capped
    // this is done to handle overcapped resources correctly
    mainCapped.value = !allFulfilled && anyCapped;
  }
});

const TrackIngredientRequirement = DeltaRecorder(
  F.Requirement,
  Value(F.Ingredient),
  Parent(Value(F.Id)),
)((root, { value: requirement }, [resource, [id]]) => {
  const target = root.fulfillments[id].ingredients[resource]!;
  target.requirement = requirement;
});

const TrackIngredientFulfillment = DeltaRecorder(
  F.Fulfillment,
  Value(F.Ingredient),
  Parent(Value(F.Id)),
)((root, fulfillment, [resource, [id]]) => {
  const target = root.fulfillments[id].ingredients[resource]!;
  target.fulfilled = fulfillment.fulfilled;
  target.eta = fulfillment.eta;
});

const TrackIngredientCapped = DeltaRecorder(
  F.Capped,
  Value(F.Ingredient),
  Parent(Value(F.Id)),
)((root, { value: capped }, [resource, [id]]) => {
  const target = root.fulfillments[id].ingredients[resource]!;
  target.capped = capped;
});

const TrackRecipeFulfillment = DeltaRecorder(
  F.Fulfillment,
  Value(F.Id),
)((root, { fulfilled }, [id]) => {
  root.fulfillments[id].fulfilled = fulfilled;
});

const TrackRecipeCapped = DeltaRecorder(
  F.Capped,
  Value(F.Id),
)((root, { value: capped }, [id]) => {
  root.fulfillments[id].capped = capped;
});

export class FulfillmentSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addStartupSystem(SpawnFulfillments)
      .addSystem(CalculateFulfillment)
      .addSystems(
        [
          TrackIngredientRequirement,
          TrackIngredientFulfillment,
          TrackIngredientCapped,
          TrackRecipeFulfillment,
          TrackRecipeCapped,
        ],
        { stage: "last-start" },
      );
  }
}
