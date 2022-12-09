import { EcsPlugin, PluginApp } from "@/app/ecs";

import { ResourceLedger } from "../core/orders";
import { BufferedReceiverSystem } from "../types/ecs";
import * as events from "../types/events";

const ProcessResourceOrders = BufferedReceiverSystem(events.ResourceOrder)(
  ResourceLedger(),
)((event, ledger) => {
  // ResourceOrder happens to have the same interface as Order
  ledger.applyOrder(event);
});

export class ResourceOrderPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.registerEvent(events.ResourceOrder).addSystem(ProcessResourceOrders);
  }
}
