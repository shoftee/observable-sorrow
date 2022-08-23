import { EcsPlugin, PluginApp } from "@/app/ecs";
import { Commands } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { NumberEffect } from "./types";

const Setup = System(Commands())((cmds) => {
  cmds.spawn(new NumberEffect("catnip.limit", 5000));
});

export class EffectsSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addStartupSystem(Setup);
  }
}
