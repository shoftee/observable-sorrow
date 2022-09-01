import { PluginApp, EcsPlugin, EcsComponent } from "@/app/ecs";
import { Commands, DiffMut, Has, Query, Read, Single } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaExtractor } from "../core";
import { DayTimer } from "../environment/types";
import { PerTickSystem } from "../time/ecs";
import { Timer } from "../time/types";

import { RareEvent } from "./types";

class Countdown extends EcsComponent {
  remaining = 0;
}

const Setup = System(Commands())((cmds) => {
  cmds.spawn(new RareEvent(), new Countdown());
});

const ProcessRareEvent = PerTickSystem(
  Query(Read(Timer)).filter(Has(DayTimer)),
  Single(DiffMut(Countdown)).filter(Has(RareEvent)),
)(([countdown]) => {
  if (countdown.remaining > 0) {
    countdown.remaining--;
  }

  // TODO: begin celestial events
});

const TimeExtractor = DeltaExtractor(Read(RareEvent))(
  (schema) => schema.astronomy,
);

const Extractors = [
  TimeExtractor(Countdown, (astronomy, countdown) => {
    astronomy.hasRareEvent = countdown.remaining > 0;
  }),
];

export class AstronomyPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addStartupSystem(Setup)
      .addSystem(ProcessRareEvent)
      .addSystems(Extractors, { stage: "last-start" });
  }
}
