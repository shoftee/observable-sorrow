import { App, EcsPlugin } from "../app";
import { World } from "../query";
import { System } from "../system";

const AdvanceWorldTicks = System(World())((world) => {
  world.ticks.updateLast();
});

export class ChangeDetectionPlugin extends EcsPlugin {
  add(app: App): void {
    app.addSystem(AdvanceWorldTicks, { stage: "last-end" });
  }
}
