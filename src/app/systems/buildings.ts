import { BuildingId, BuildingMetadata } from "../core/metadata";
import { System } from "../ecs/system";
import { EntityAdmin } from "../game/entity-admin";
import { BuildingEntity } from "../buildings/entity";

export interface IBuildingSystem {
  order(id: BuildingId): void;
}

export class BuildingSystem extends System implements IBuildingSystem {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  // external contract
  order(id: BuildingId): void {
    const building = this.admin.building(id);
    for (const ingredient of building.price.ingredients) {
      const resource = this.admin.resource(ingredient.id);
      resource.mutations.take(ingredient.amount);
    }
    building.buildQueue.construct();
  }

  // update method
  update(_dt: number): void {
    for (const building of this.admin.buildings()) {
      const levelChanged = this.processBuildQueue(building);
      if (levelChanged) {
        this.updatePrices(building);
        building.changes.notify("ingredients");
      }
    }
  }

  // specific update behaviors
  private processBuildQueue(building: BuildingEntity): boolean {
    let level = building.state.level;
    building.buildQueue.consume((item) => {
      if (item.intent == "construct") {
        level++;
      } else {
        level--;
      }
    });

    if (level != building.state.level) {
      building.state.level = level;
      building.changes.notify("level");
      return true;
    }

    return false;
  }

  private updatePrices(building: BuildingEntity) {
    const buildingMetadata = BuildingMetadata[building.id];
    const priceRatio = buildingMetadata.priceRatio;
    const level = building.state.level;
    const priceMultiplier = Math.pow(priceRatio, level);

    for (let i = 0; i < buildingMetadata.ingredients.length; i++) {
      const ingredientMetadata = buildingMetadata.ingredients[i];
      const effective = building.price.ingredients[i];
      effective.amount = ingredientMetadata.amount * priceMultiplier;
    }
  }
}
