import { reactive } from "vue";

import { JobId, PopId } from "@/app/interfaces";
import { PopState } from "@/app/state";
import { Enumerable } from "@/app/utils/enumerable";

import { Entity, EntityPool, Persisted, Watched, Watcher } from ".";
import { SaveState } from "@/app/store";

export class PopEntity extends Entity<PopId> implements Watched {
  readonly state: PopState;

  constructor(id: number) {
    super(`pop-${id}` as PopId);

    this.state = reactive({
      job: undefined,
      name: `Kitten #${id}`,
    });
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

export class PopsPool
  extends EntityPool<PopId, PopEntity>
  implements Persisted
{
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
      const pop = this.addNewPopEntity();
      yield pop;
    }
  }

  private addNewPopEntity(): PopEntity {
    const pop = new PopEntity(this.nextPopId++);
    this.ids.push(pop.id);
    super.add(pop);
    return pop;
  }

  loadState(save: SaveState): void {
    this.ids.length = 0;
    this.pool.clear();
    this.nextPopId = 1;

    if (save.pops !== undefined) {
      for (const savedPop of save.pops) {
        const pop = this.addNewPopEntity();
        pop.state.job = savedPop.job;
        pop.state.name = savedPop.name;
      }
    }
  }

  saveState(save: SaveState): void {
    save.pops = [];
    for (const pop of this.enumerate()) {
      save.pops.push({
        job: pop.state.job,
        name: pop.state.name,
      });
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

  withJob(id: JobId | undefined): Enumerable<PopEntity> {
    return this.enumerate().filter((item) => item.state.job === id);
  }
}
