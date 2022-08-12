import { App, EcsPlugin } from "../app";

import { ChangeDetectionPlugin } from "./change-detection";

export class MinimalPlugins extends EcsPlugin {
  add(app: App): void {
    app.addPlugin(new ChangeDetectionPlugin());
  }
}
