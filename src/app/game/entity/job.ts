import { reactive } from "vue";

import { JobId } from "@/app/interfaces";
import { JobMetadataType, JobState, Meta } from "@/app/state";

import { Entity, EntityPool, Watched, Watcher } from ".";

export class JobEntity extends Entity<JobId> implements Watched {
  readonly state: JobState;

  constructor(readonly meta: JobMetadataType) {
    super(meta.id);

    this.state = reactive({
      unlocked: meta.unlockEffect === undefined,
    });
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

export class JobsPool extends EntityPool<JobId, JobEntity> {
  constructor(watcher: Watcher) {
    super("jobs", watcher);
    for (const meta of Meta.jobs()) {
      this.add(new JobEntity(meta));
    }
  }
}
