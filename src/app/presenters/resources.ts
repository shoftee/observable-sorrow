import { computed, ComputedRef, reactive } from "vue";

import { ResourceId } from "@/_interfaces";
import { Meta, ResourceMetadataType } from "@/_state";

import { IStateManager } from ".";

export class ResourcesPresenter {
  readonly all: ComputedRef<ResourceItem[]>;

  constructor(private readonly manager: IStateManager) {
    this.all = computed(() =>
      Meta.resources()
        .map((meta) => this.newResource(meta))
        .toArray(),
    );
  }

  private newResource(meta: ResourceMetadataType): ResourceItem {
    const res = this.manager.resource(meta.id);

    return reactive({
      id: meta.id,
      label: meta.label,
      unlocked: computed(() => res.unlocked),
      amount: computed(() => res.amount),
      change: computed(() => res.change),
      capacity: computed(() => res.capacity),
      modifier:
        meta.id !== "catnip"
          ? undefined
          : computed(() => this.computeCatnipModifier()),
    });
  }

  private computeCatnipModifier() {
    const production = this.manager.effect("catnip-field.catnip");
    const catnipProduction = production.value ?? 0;

    const weather = this.manager.effect("catnip-field.weather");
    const weatherModifier = weather.value ?? 0;

    if (catnipProduction === 0 || weatherModifier === 0) {
      return undefined;
    } else {
      return weatherModifier;
    }
  }
}

export interface ResourceItem {
  readonly id: ResourceId;
  label: string;
  unlocked: boolean;
  amount: number;
  change: number;
  capacity?: number;
  modifier?: number;
}
