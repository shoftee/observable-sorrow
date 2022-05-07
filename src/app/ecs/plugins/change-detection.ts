import { App, Plugin } from "../app";
import { System, World } from "../system";

const AdvanceSystemTicks = System(World())((world) => {
  world.ticks.advance();
});

export class ChangeDetectionPlugin extends Plugin {
  add(app: App): void {
    app.addSystem(AdvanceSystemTicks, "last");
  }
}
