import { cache } from "@/app/utils/cache";

import { EcsPlugin, PluginApp } from "@/app/ecs";
import { Receive } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { ResourceMapQuery, applyOrder, createLedger } from "../core/orders";
import * as events from "../types/events";

const ProcessResourceOrders = System(
  Receive(events.ResourceOrder),
  ResourceMapQuery,
)((orders, resources) => {
  // Initialize the ambient ledger.
  const ambientCache = cache(() => createLedger(resources));

  for (const order of orders.pull()) {
    const ambient = ambientCache.retrieve();
    applyOrder(order, ambient, resources);
  }
});

export class ResourceOrderPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.registerEvent(events.ResourceOrder).addSystem(ProcessResourceOrders);
  }
}
