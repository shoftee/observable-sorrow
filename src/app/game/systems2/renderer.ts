import { OnRenderHandler } from "@/app/interfaces";

import { App, Plugin, EcsResource } from "@/app/ecs";
import { Res, System } from "@/app/ecs/system";

import { DeltaBuffer } from "./types";

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

export class RendererPlugin extends Plugin {
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
