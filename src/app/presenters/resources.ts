import { computed, ComputedRef, reactive } from "vue";

import { ResourceId } from "@/_interfaces";
import { ResourceMetadata, ResourceMetadataType } from "@/_state";

import { IRootPresenter } from ".";

export interface Resource {
  readonly id: ResourceId;
  label: string;
  unlocked: boolean;
  amount: number;
  change: number;
  capacity?: number;
  modifier?: number;
}

export interface IResourcePresenter {
  readonly all: ComputedRef<Resource[]>;
}

export class ResourcesPresenter implements IResourcePresenter {
  readonly all: ComputedRef<Resource[]>;

  constructor(private readonly root: IRootPresenter) {
    this.all = computed(() =>
      Array.from(Object.values(ResourceMetadata), (meta) =>
        this.newResource(meta),
      ),
    );
  }

  private newResource(meta: ResourceMetadataType): Resource {
    const res = this.root.resource(meta.id);

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
    const production = this.root.effect("catnip-field.production.catnip");
    const catnipProduction = production.value ?? 0;

    const weather = this.root.effect("catnip-field.weather");
    const weatherModifier = weather.value ?? 0;

    if (catnipProduction === 0 || weatherModifier === 0) {
      return undefined;
    } else {
      return weatherModifier;
    }
  }
}
