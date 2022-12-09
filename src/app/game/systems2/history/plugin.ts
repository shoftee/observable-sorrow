import { EcsPlugin, PluginApp } from "@/app/ecs";
import { Receive, Res } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { map } from "@/app/utils/collections";

import { DeltaBuffer } from "../core";
import { HistoryEventOccurred } from "../types";

const AppendHistoryEvents = System(
  Receive(HistoryEventOccurred),
  Res(DeltaBuffer),
)((receiver, deltas) => {
  const events = map(receiver.pull(), (e) => e.event);

  deltas.components.pushEvents().history(events);
});

export class HistoryPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .registerEvent(HistoryEventOccurred)
      .addSystem(AppendHistoryEvents, { stage: "last-start" });
  }
}
