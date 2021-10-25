import { BooleanEffectId, TechId } from "@/app/interfaces";
import { Flag, Meta, UnlockMode } from "@/app/state";
import { asEnumerable } from "@/app/utils/enumerable";

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
  private readonly techDeps = new Map<TechId, Set<TechId>>();

  init(): void {
    for (const tech of Meta.techs()) {
      const deps = this.techDeps.get(tech.id) ?? new Set<TechId>();
      for (const dep of tech.dependsOn) {
        deps.add(dep);
      }
      this.techDeps.set(tech.id, deps);
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

    for (const [id, deps] of this.techDeps) {
      const tech = this.admin.tech(id);
      if (!tech.state.unlocked) {
        tech.state.unlocked = asEnumerable(deps)
          .map((id) => this.admin.tech(id))
          .all((dep) => dep.state.researched);
      }
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
      const unlock = building.meta.unlock;
      if (unlock === undefined) {
        // unlock requirements not specified, unlock automatically
        building.state.unlocked = true;
        return;
      }

      const effect = unlock.unlockEffect;
      if (effect !== undefined) {
        // building is gated behind an effect
        const entity = this.admin.boolean(effect);
        if (!entity.state.value) {
          // effect not satisfied, keep locked
          return;
        }
      }

      const ratio = unlock.priceRatio;
      if (ratio === undefined) {
        // price ratio not specified, unlock automatically.
        building.state.unlocked = true;
        return;
      }

      for (const ingredient of building.state.ingredients) {
        const threshold = ingredient.requirement * ratio;
        if (ingredient.fulfillment >= threshold) {
          building.state.unlocked = true;
          return;
        }
      }
    }
  }
}
