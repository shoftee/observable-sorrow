import { PluginApp, EcsPlugin } from "@/app/ecs";
import { Commands } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { DeltaExtractor } from "../core";

import { RareEvent } from "./types";

const Setup = System(Commands())((cmds) => {
  cmds.spawn(new RareEvent());
});

const Extractors = [
  DeltaExtractor()((schema) => schema.astronomy)(RareEvent, (astronomy) => {
    astronomy.hasRareEvent = false;
  }),
];

export class AstronomyPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addStartupSystem(Setup);
    app.addSystems(Extractors, { stage: "last-start" });
  }
}
