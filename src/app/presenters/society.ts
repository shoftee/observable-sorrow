import { computed, reactive } from "vue";

import { JobId, PopId } from "@/_interfaces";
import { JobEffectType, JobMetadataType, Meta, PopState } from "@/_state";

import { EffectItem, IStateManager } from ".";

export interface PopItem {
  id: string;
  job: JobId | undefined;
}

export interface JobItem {
  id: JobId;
  label: string;
  description: string;
  flavor?: string;
  pops: number;
  effects: EffectItem[];
  capped: boolean;
  unlocked: boolean;
}

export interface Values<T> {
  values: T[];
}

export class SocietyPresenter {
  readonly pops: Values<PopItem>;
  readonly jobs: Map<JobId, JobItem>;

  constructor(manager: IStateManager) {
    this.pops = reactive({
      values: computed(() =>
        manager
          .pops()
          .map(([id, state]) => this.newPopItem(id, state))
          .toArray(),
      ),
    });

    this.jobs = reactive(
      new Map<JobId, JobItem>(
        Meta.jobs().map((meta) => [meta.id, this.newJobItem(meta, manager)]),
      ),
    );
  }

  private newJobItem(meta: JobMetadataType, manager: IStateManager): JobItem {
    return reactive({
      id: meta.id,
      label: meta.label,
      description: meta.description,
      flavor: meta.flavor,
      capped: false,
      unlocked: true,
      pops: computed(() => manager.pops().count(([, s]) => s.job === meta.id)),
      effects: computed(() => this.effects(meta.effects, manager)),
    });
  }

  private effects(
    effects: JobEffectType[],
    manager: IStateManager,
  ): EffectItem[] {
    return Array.from(effects, (meta) =>
      reactive({
        id: meta.id,
        label: meta.label,
        singleAmount: manager.effectView(meta.base),
        totalAmount: manager.effectView(meta.total),
      }),
    );
  }

  private newPopItem(id: PopId, state: PopState): PopItem {
    return reactive({
      id: id,
      job: state.job,
    });
  }
}
