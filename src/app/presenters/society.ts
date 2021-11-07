import { computed, ComputedRef, reactive } from "vue";

import { JobId, PopId } from "@/app/interfaces";
import { JobEffectType, JobState, Meta, PopState } from "@/app/state";

import { IStateManager } from ".";
import {
  EffectItem,
  effectTree,
  EffectTree,
  NumberView,
  numberView,
} from "./common";

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

export interface HappinessItem {
  view: NumberView;
  effectTree: EffectTree;
}

export class SocietyPresenter {
  readonly pops: ComputedRef<PopItem[]>;
  readonly jobs: ComputedRef<JobItem[]>;

  readonly happiness: HappinessItem;

  constructor(manager: IStateManager) {
    this.pops = computed(() =>
      manager
        .pops()
        .map(([id, state]) => this.newPopItem(id, state))
        .toArray(),
    );

    this.jobs = computed(() =>
      manager
        .jobs()
        .map(([id, state]) => this.newJobItem(id, state, manager))
        .toArray(),
    );

    this.happiness = reactive({
      view: computed(() =>
        numberView(manager, "population.happiness.total", "negative"),
      ),
      effectTree: effectTree("population.happiness.total", manager),
    });
  }

  private newJobItem(
    id: JobId,
    state: JobState,
    manager: IStateManager,
  ): JobItem {
    const meta = Meta.job(id);
    return reactive({
      id: meta.id,
      label: meta.label,
      description: meta.description,
      flavor: meta.flavor,
      capped: false,
      unlocked: computed(() => state.unlocked),
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
        singleAmount: computed(() => numberView(manager, meta.base)),
        totalAmount: computed(() => numberView(manager, meta.total)),
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
