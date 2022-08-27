import { EcsPlugin, PluginApp } from "@/app/ecs";
import { Receive } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { Ledger } from "@/app/state";
import { cache } from "@/app/utils/cache";

import * as events from "../types/events";
import { ResourceMapQuery, applyOrder } from "../core/orders";

const ProcessResourceOrders = System(
  Receive(events.ResourceOrder),
  ResourceMapQuery,
)((orders, resources) => {
  const ambientCache = cache(() => {
    // Initialize the ambient deltas.
    const ambient = new Ledger();
    for (const [id, [, , entry]] of resources) {
      ambient.add(id, entry);
    }
    return ambient;
  });

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
