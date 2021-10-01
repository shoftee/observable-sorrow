import { BuildingMetadata } from "@/_state";
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
      this.processBuildQueue(building);
      this.updatePrices(building);
    }
  }

  // specific update behaviors
  private processBuildQueue(building: BuildingEntity): void {
    let level = building.state.level;
    building.buildQueue.consume((item) => {
      if (item.intent == "construct") {
        for (const [resourceId, amount] of building.state.ingredients) {
          const resource = this.admin.resource(resourceId);
          resource.mutations.take(amount);
        }
        level++;
      }
    });

    building.state.level = level;
  }

  private updatePrices(building: BuildingEntity): void {
    const buildingMetadata = BuildingMetadata[building.id];
    const prices = buildingMetadata.prices;
    const level = building.state.level;
    const priceMultiplier = Math.pow(prices.ratio, level);

    for (const [id, amount] of prices.baseIngredients) {
      building.state.ingredients.set(id, amount * priceMultiplier);
    }
  }
}
