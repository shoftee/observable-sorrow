import { watchSyncEffect } from "vue";

import { BooleanEffectId } from "@/app/interfaces";
import { Meta, UnlockMode } from "@/app/state";

import { System } from ".";
import { ResourceEntity, BuildingEntity } from "../entity";

type Unlockable = {
  meta: {
    unlockEffect?: BooleanEffectId;
  };
  state: {
    unlocked: boolean;
  };
};

export class LockToggleSystem extends System {
  init(): void {
    // configure reactive unlocking of techs
    for (const meta of Meta.techs()) {
      watchSyncEffect(() => {
        const tech = this.admin.tech(meta.id).state;
        if (!tech.unlocked) {
          for (const dep of meta.dependsOn) {
            if (!this.admin.tech(dep).state.researched) {
              return;
            }
          }

          tech.unlocked = true;
        }
      });
    }
  }

  update(): void {
    for (const unlockable of this.unlockables()) {
      this.applyUnlockEffect(unlockable);
    }

    for (const resource of this.admin.resources()) {
      this.updateResourceUnlocked(resource);
    }

    for (const building of this.admin.buildings()) {
      this.updateBuildingUnlocked(building);
    }
  }

  private *unlockables(): Iterable<Unlockable> {
    for (const section of this.admin.sections()) {
      yield section;
    }
    for (const job of this.admin.jobs()) {
      yield job;
    }
  }

  private applyUnlockEffect(entity: Unlockable): void {
    const { state, meta } = entity;
    const unlockEffect = meta.unlockEffect;
    if (state.unlocked || unlockEffect === undefined) {
      return;
    }

    state.unlocked = this.admin.boolean(unlockEffect).getOr(false);
  }

  private updateResourceUnlocked(resource: ResourceEntity): void {
    const { state, meta } = resource;

    if (!state.unlocked) {
      const unlockMode = meta.unlockMode ?? UnlockMode.FirstQuantity;
      switch (unlockMode) {
        case UnlockMode.FirstQuantity:
          if (state.amount > 0) state.unlocked = true;
          break;
        case UnlockMode.FirstCapacity: {
          if (state.capacity ?? 0 > 0) state.unlocked = true;
          break;
        }
      }
    }
  }

  private updateBuildingUnlocked(building: BuildingEntity): void {
    const { state, meta } = building;
    if (!state.unlocked) {
      const unlock = meta.unlock;
      if (unlock === undefined) {
        // unlock requirements not specified, unlock automatically
        state.unlocked = true;
        return;
      }

      const effect = unlock.unlockEffect;
      if (effect !== undefined) {
        // building is gated behind an effect
        if (!this.admin.boolean(effect).getOr(false)) {
          // effect not satisfied, keep locked
          return;
        }
      }

      const ratio = unlock.priceRatio;
      if (ratio === undefined) {
        // price ratio not specified, unlock automatically.
        state.unlocked = true;
        return;
      }

      const fulfillment = this.admin.fulfillment(building.id).state;
      for (const ingredient of fulfillment.ingredients) {
        const threshold = ingredient.requirement * ratio;
        if (ingredient.fulfillment >= threshold) {
          state.unlocked = true;
          return;
        }
      }
    }
  }
}
