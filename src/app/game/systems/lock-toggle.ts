import { BooleanEffectId } from "@/app/interfaces";
import { Flag, UnlockMode } from "@/app/state";

import { ResourceEntity, BuildingEntity } from "../entity";

import { System } from ".";

type Unlockable = {
  meta: {
    unlockEffect?: BooleanEffectId;
  };
  state: {
    unlocked: boolean;
  };
};

export class LockToggleSystem extends System {
  update(): void {
    for (const section of this.unlockables()) {
      this.applyUnlockEffect(section);
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
    const unlockEffect = entity.meta.unlockEffect;
    if (entity.state.unlocked || unlockEffect === undefined) {
      return;
    }

    const effect = this.admin.boolean(unlockEffect);
    entity.state.unlocked = effect.state.value ?? false;
  }

  private updateResourceUnlocked(resource: ResourceEntity): void {
    const state = resource.state;
    const meta = resource.meta;
    if (!state.unlocked) {
      const unlockMode = meta.unlockMode ?? UnlockMode.FirstQuantity;
      switch (unlockMode) {
        case UnlockMode.FirstQuantity:
          if (state.amount > 0) state.unlocked = true;
          break;
        case UnlockMode.FirstCapacity:
          if (state.capacity && state.capacity > 0) state.unlocked = true;
          break;
      }
    } else {
      // some resources re-lock when they are depleted
      if (state.unlocked && meta.flags[Flag.RelockWhenDepleted]) {
        state.unlocked = false;
      }
    }
  }

  private updateBuildingUnlocked(building: BuildingEntity): void {
    if (!building.state.unlocked) {
      for (const ingredient of building.state.ingredients) {
        const unlockThreshold =
          ingredient.requirement * building.meta.unlockRatio;
        if (ingredient.fulfillment >= unlockThreshold) {
          building.state.unlocked = true;
          return;
        }
      }
    }
  }
}
