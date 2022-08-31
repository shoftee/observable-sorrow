import { Meta, SectionMetadataType } from "@/app/state";

import { EcsPlugin, PluginApp } from "@/app/ecs";
import { Commands } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { Unlocked, UnlockOnEffect } from "../unlock/types";
import { AlertLabel, Section, Title } from "./types";

function* sectionComponents(meta: SectionMetadataType) {
  yield new Section(meta.id);
  yield new Title(meta.label);
  yield new Unlocked(!meta.unlockEffect);
  yield new AlertLabel();
}

const Setup = System(Commands())((cmds) => {
  for (const meta of Meta.sections()) {
    const entity = cmds.spawn(...sectionComponents(meta));
    if (meta.unlockEffect) {
      const effect = meta.unlockEffect;
      entity.defer((e) => {
        cmds.spawnChild(e, new Unlocked(false), new UnlockOnEffect(effect));
      });
    }
  }
});

export class SectionSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addStartupSystem(Setup);
  }
}
