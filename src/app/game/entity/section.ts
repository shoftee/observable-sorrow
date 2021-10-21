import { reactive } from "vue";

import { SectionId } from "@/app/interfaces";
import { Meta, SectionMetadataType, SectionState } from "@/app/state";

import { Entity, EntityPool, Watcher } from ".";

export class SectionEntity extends Entity<SectionId> {
  readonly state: SectionState;

  constructor(readonly meta: SectionMetadataType) {
    super(meta.id);

    this.state = reactive({
      unlocked: meta.unlocked ?? false,
      label: meta.label,
      alert: undefined,
    });
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

export class SectionsPool extends EntityPool<SectionId, SectionEntity> {
  constructor(watcher: Watcher) {
    super("sections", watcher);
    for (const meta of Meta.sections()) {
      this.add(new SectionEntity(meta));
    }
  }
}
