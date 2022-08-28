import { EcsPlugin, PluginApp } from "@/app/ecs";
import { WorldCmds, EntityCmds, Commands, Value } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { NumberEffectId } from "@/app/interfaces";
import { DeltaExtractor } from "../core/renderer";
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
  cmds: WorldCmds,
  container: EntityCmds,
  item: EffectCompositeItem,
) {
  if (item instanceof Function) {
    const expr = item;
    container.entity((e) => {
      const innerContainer = cmds.spawnChild(e, ...numberComponents());
      for (const innerItem of expr()) {
        addEffectComponents(cmds, innerContainer, innerItem);
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

const NumberExtractor = DeltaExtractor(Value(NumberEffect))(
  (schema, [id]) => schema.numbers[id],
);

const DeltaExtractors = [
  NumberExtractor(NumberValue, (effect, { value }) => {
    effect.value = value;
  }),
];

export class EffectsSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addStartupSystem(Setup)
      .addSystems(DeltaExtractors, { stage: "last-start" });
  }
}
