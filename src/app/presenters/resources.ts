import { computed, ComputedRef, reactive } from "vue";

import { ResourceId } from "@/_interfaces";
import { ResourceMetadata, ResourceMetadataType } from "@/_state";

import { RootPresenter } from "./root";
import { ResourceState } from "../resources";
import { EffectState } from "../effects";

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

export class ResourcePresenter implements IResourcePresenter {
  readonly all: ComputedRef<Resource[]>;

  constructor(private readonly root: RootPresenter) {
    this.all = computed(() =>
      Array.from(Object.values(ResourceMetadata), (meta) =>
        this.newResource(meta),
      ),
    );
  }

  private newResource(meta: ResourceMetadataType): Resource {
    const res = this.root.get<ResourceState>(meta.id);
    const eff = this.root.get<EffectState>("effects");

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
          : computed(() => {
              const catnipProduction = eff["catnip-field-production"] ?? 0;
              const weatherModifier = eff["catnip-field-weather"] ?? 0;
              if (catnipProduction === 0 || weatherModifier === 0) {
                return undefined;
              } else {
                return weatherModifier;
              }
            }),
    });
  }
}
