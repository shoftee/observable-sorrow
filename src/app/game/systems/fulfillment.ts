import { watchSyncEffect } from "vue";

import { System } from ".";

export class FulfillmentSystem extends System {
  init(): void {
    // reactive update of building prices
    for (const { id, meta, state } of this.admin.buildings()) {
      const basePrices = meta.prices.base;
      const priceRatio = meta.prices.ratio;

      const fulfillment = this.admin.fulfillment(id).state;
      for (const ingredient of fulfillment.ingredients) {
        const basePrice = basePrices[ingredient.resourceId];
        watchSyncEffect(() => {
          ingredient.requirement =
            basePrice! * Math.pow(priceRatio, state.level);
        });
      }
    }
  }

  update(): void {
    for (const { state } of this.admin.fulfillments()) {
      let listCapped = false;
      let listFulfilled = true;
      const ingredients = state.ingredients;
      for (const ingredient of ingredients) {
        const resource = this.admin.resource(ingredient.resourceId).state;
        const { amount, change, capacity } = resource;

        let fulfilled = false;
        let fulfillmentTime = undefined;
        const requirement = ingredient.requirement;
        if (amount >= requirement) {
          fulfilled = true;
        } else {
          if (change > 0) {
            if (capacity !== undefined && capacity < requirement) {
              // requirement won't be fulfilled
              fulfillmentTime = Number.POSITIVE_INFINITY;
            } else {
              fulfillmentTime = (requirement - amount) / change;
            }
          }
        }

        ingredient.fulfillment = amount;
        ingredient.fulfillmentTime = fulfillmentTime;

        ingredient.fulfilled = fulfilled;
        listFulfilled &&= fulfilled;

        const capped = capacity !== undefined && requirement > capacity;
        listCapped ||= capped;
        ingredient.capped = capped;
      }

      state.fulfilled = listFulfilled;
      state.capped = listCapped;
    }
  }
}
