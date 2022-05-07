import { App, Plugin } from "../app";
import { ChangeDetectionPlugin } from "./change-detection";

import { TimePlugin } from "./time";

export class MinimalPlugins extends Plugin {
  add(app: App): void {
    app.addPlugin(new TimePlugin());
    app.addPlugin(new ChangeDetectionPlugin());
  }
}
