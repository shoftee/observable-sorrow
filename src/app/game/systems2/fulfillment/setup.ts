import { EcsPlugin, PluginApp } from "@/app/ecs";
import { Commands } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { ResourceId } from "@/app/interfaces";
import { Meta } from "@/app/state";

import * as F from "../types/fulfillments";

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

export class FulfillmentSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addStartupSystem(SpawnFulfillments);
  }
}
