import { App, EcsPlugin } from "../app";

import { ChangeDetectionPlugin } from "./change-detection";
import { TimePlugin } from "./time";

export class MinimalPlugins extends EcsPlugin {
  add(app: App): void {
    app.addPlugin(new TimePlugin());
    app.addPlugin(new ChangeDetectionPlugin());
  }
}
