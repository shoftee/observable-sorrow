import { OnRenderHandler } from "@/app/interfaces";

import { PluginApp, EcsPlugin, EcsResource } from "@/app/ecs";

import { System } from "@/app/ecs/system";
import { Res } from "@/app/ecs/query";

import { DeltaBuffer } from "./core/renderer";

class Renderer extends EcsResource {
  constructor(readonly onRender: OnRenderHandler) {
    super();
  }
}

const FlushChanges = System(
  Res(DeltaBuffer),
  Res(Renderer),
)((buffer, renderer) => {
  renderer.onRender(buffer.components);
  buffer.components.clear();
});

export class RendererPlugin extends EcsPlugin {
  constructor(private readonly onRender: OnRenderHandler) {
    super();
  }

  add(app: PluginApp): void {
    app
      .insertResource(new DeltaBuffer())
      .insertResource(new Renderer(this.onRender))
      .addSystem(FlushChanges, { stage: "last" });
  }
}
