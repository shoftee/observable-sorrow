import { reactive } from "vue";

import { EffectTreeState } from "@/app/state";

import { Entity, Watcher } from ".";

export class EffectTreeEntity extends Entity<"effect-tree"> {
  readonly state: EffectTreeState;

  constructor() {
    super("effect-tree");

    this.state = reactive(new EffectTreeState());
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}
