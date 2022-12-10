import { ResourceMap } from "@/app/state";

import { PluginApp, EcsPlugin, EcsComponent } from "@/app/ecs";
import {
  Commands,
  DiffMut,
  Dispatch,
  Has,
  Query,
  Read,
  Single,
  Value,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaExtractor } from "../core";
import { ResourceLedger } from "../core/orders";

import { NumberState } from "../effects/ecs";
import { SectionPredicate } from "../section/ecs";
import { PerTickSystem } from "../time/ecs";
import { DayTimer } from "../environment/types";
import { label } from "../history/types";
import { Timer } from "../time/types";
import { Unlocked } from "../unlock/types";

import { HistoryEventOccurred, SkyObserved } from "../types/events";
import { Prng } from "../types/common";
import { ThrottledReceiverSystem } from "../types/ecs";

import { RareEvent } from "./types";

const RARE_EVENT_BASE_CHANCE = 1 / 400;

class Countdown extends EcsComponent {
  remaining = 0;
}

const Setup = System(Commands())((cmds) => {
  cmds.spawn(new RareEvent(), new Countdown(), new Prng());
});

const ProcessSkyObserved = ThrottledReceiverSystem(SkyObserved)(
  Single(DiffMut(Countdown)).filter(Has(RareEvent)),
  NumberState(),
  ResourceLedger(),
  Dispatch(HistoryEventOccurred),
)((_, [countdown], numbers, ledger, history) => {
  countdown.remaining = 0;

  const order = {
    debits: ResourceMap.fromObject({
      science: numbers["astronomy.rare-event.reward"] ?? 25,
    }),
  };

  ledger.applyOrder(order, {
    success(rewards) {
      const scienceAmount = rewards.get("science") ?? 0;
      history.dispatch(
        new HistoryEventOccurred(
          scienceAmount > 0
            ? label("astronomy.observed-sky-reward.gained", { scienceAmount })
            : label("astronomy.observed-sky-reward.capped"),
        ),
      );
    },
  });
});

const ProcessRareEvent = PerTickSystem(
  Query(Read(Timer)).filter(Has(DayTimer)),
)(
  Single(DiffMut(Countdown), Read(Prng)).filter(Has(RareEvent)),
  Single(Value(Unlocked)).filter(SectionPredicate("science")),
  Dispatch(HistoryEventOccurred),
)(([countdown, prng], [scienceUnlocked], history) => {
  if (countdown.remaining > 0) {
    countdown.remaining--;
  }

  if (scienceUnlocked) {
    if (prng.binary(RARE_EVENT_BASE_CHANCE)) {
      history.dispatch(new HistoryEventOccurred(label("astronomy.rare-event")));
      countdown.remaining = 30;
    }
  }
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
      .registerEvent(SkyObserved)
      .addStartupSystem(Setup)
      .addSystem(ProcessSkyObserved, { stage: "main-start" })
      .addSystem(ProcessRareEvent)
      .addSystems(Extractors, { stage: "last-start" });
  }
}
