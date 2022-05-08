import { App, EcsPlugin } from "../app";
import { System, World } from "../system";

const AdvanceSystemTicks = System(World())((world) => {
  world.ticks.updateLast();
});

export class ChangeDetectionPlugin extends EcsPlugin {
  add(app: App): void {
    app.addSystem(AdvanceSystemTicks, "last");
  }
}
