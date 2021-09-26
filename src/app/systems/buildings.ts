import { BuildingMetadata } from "../core/metadata";
import { System } from "../ecs/system";
import { EntityAdmin } from "../game/entity-admin";
import { BuildingEntity } from "../buildings/entity";

export class BuildingSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  // update method
  update(): void {
    for (const building of this.admin.buildings()) {
      const levelChanged = this.processBuildQueue(building);
      if (levelChanged) {
        this.updatePrices(building);
        building.changes.mark("ingredients");
      }
    }
  }

  // specific update behaviors
  private processBuildQueue(building: BuildingEntity): boolean {
    let level = building.state.level;
    building.buildQueue.consume((item) => {
      if (item.intent == "construct") {
        for (const ingredient of building.state.ingredients) {
          const resource = this.admin.resource(ingredient.id);
          resource.mutations.take(ingredient.amount);
        }
        level++;
      }
    });

    if (level != building.state.level) {
      building.state.level = level;
      return true;
    }

    return false;
  }

  private updatePrices(building: BuildingEntity) {
    const buildingMetadata = BuildingMetadata[building.id];
    const prices = buildingMetadata.prices;
    const level = building.state.level;
    const priceMultiplier = Math.pow(prices.ratio, level);

    for (let i = 0; i < prices.baseIngredients.length; i++) {
      const ingredientMetadata = prices.baseIngredients[i];
      const effective = building.state.ingredients[i];
      effective.amount = ingredientMetadata.amount * priceMultiplier;
    }
  }
}
