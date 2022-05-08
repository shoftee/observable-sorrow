import { OnRenderHandler } from "@/app/interfaces";

import { App, EcsPlugin, EcsResource } from "@/app/ecs";

import { DeltaBuffer } from "./types";
import { System } from "@/app/ecs/system";
import { Res } from "@/app/ecs/query";

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
});

export class RendererPlugin extends EcsPlugin {
  constructor(readonly onRender: OnRenderHandler) {
    super();
  }

  add(app: App): void {
    app
      .insertResource(new DeltaBuffer())
      .insertResource(new Renderer(this.onRender))
      .addSystem(FlushChanges, "last");
  }
}
