import { PluginApp, EcsPlugin } from "../app";

import { ChangeDetectionPlugin } from "./change-detection";

export class MinimalPlugins extends EcsPlugin {
  add(app: PluginApp): void {
    app.addPlugin(new ChangeDetectionPlugin());
  }
}
