import { reactive } from "vue";

import { PopId } from "@/_interfaces";
import { PopState } from "@/_state";

import { Entity, EntityPool, Watcher } from ".";

export class PopEntity extends Entity<PopId> {
  readonly state: PopState;

  constructor(id: number) {
    super(`pop-${id}` as PopId);

    this.state = reactive(new PopState());
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

export class PopsPool extends EntityPool<PopId, PopEntity> {
  private readonly ids: PopId[];
  private nextPopId = 1;

  constructor(watcher: Watcher) {
    super("pops", watcher);

    this.ids = [];
  }

  grow(count: number): PopEntity[] {
    return Array.from(this.growInternal(count));
  }

  private *growInternal(count: number): Iterable<PopEntity> {
    let i = 0;
    while (i++ < count) {
      const pop = new PopEntity(this.nextPopId++);
      this.ids.push(pop.id);
      super.add(pop);
      yield pop;
    }
  }

  kill(count: number): PopEntity[] {
    return Array.from(this.killInternal(count));
  }

  private *killInternal(count: number): Iterable<PopEntity> {
    for (const id of this.ids.splice(this.ids.length - count)) {
      yield super.get(id);
      super.remove(id);
    }
  }
}
