import { App, Plugin, EcsResource } from "@/app/ecs";
import { Res, System } from "@/app/ecs/system";

import { OnEventHandler, OnMutationHandler } from "@/app/interfaces";

import { EntityWatcher } from "./_watcher";

class Renderer extends EcsResource {
  constructor(
    readonly onMutation: OnMutationHandler,
    readonly onLogEvent: OnEventHandler,
  ) {
    super();
  }
}

const FlushChanges = System(
  Res(EntityWatcher),
  Res(Renderer),
)((watcher, renderer) => {
  watcher.flushMutations((changes) => {
    renderer.onMutation(changes);
  });
  watcher.flushEvents((logEvents) => {
    renderer.onLogEvent(logEvents);
  });
});

export class RendererPlugin extends Plugin {
  constructor(
    private readonly onMutation: OnMutationHandler,
    private readonly onLogEvent: OnEventHandler,
  ) {
    super();
  }

  add(app: App): void {
    app
      .insertResource(new EntityWatcher())
      .insertResource(new Renderer(this.onMutation, this.onLogEvent))
      .addSystem(FlushChanges, "last");
  }
}
