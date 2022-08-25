import { EcsPlugin, PluginApp } from "@/app/ecs";
import { WorldCmds, EntityCmds, Commands } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { NumberEffectId } from "@/app/interfaces";
import {
  NumberValue,
  NumberEffect,
  NumberExprs,
  Markers,
  EffectCompositeItem,
} from "./types";

function* numberComponents(id?: NumberEffectId) {
  yield new Markers.Effect();
  if (id) {
    yield new NumberEffect(id);
  }
  yield new NumberValue();
}

function addEffectComponents(
  cmd: WorldCmds,
  container: EntityCmds,
  item: EffectCompositeItem,
) {
  if (item instanceof Function) {
    container.entity((e) => {
      for (const innerItem of item()) {
        const innerContainer = cmd.spawnChild(e, ...numberComponents());
        addEffectComponents(cmd, innerContainer, innerItem);
      }
    });
  } else {
    container.insert(item);
  }
}

const Setup = System(Commands())((cmds) => {
  for (const [id, expr] of Object.entries(NumberExprs)) {
    const current = cmds.spawn(...numberComponents(id as NumberEffectId));
    for (const item of expr()) {
      addEffectComponents(cmds, current, item);
    }
  }
});

export class EffectsSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addStartupSystem(Setup);
  }
}
