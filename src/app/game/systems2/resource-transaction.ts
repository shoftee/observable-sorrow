import { EcsPlugin, PluginApp } from "@/app/ecs";
import { Query, Read, Receive } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { Name, Resource, ResourceTransactionEvent } from "./types";

const ApplyTransactions = System(Query(Read(Name), Read(Resource)), Receive(ResourceTransactionEvent))((resQuery, transactions) => {
    for (const tx of transactions.pull()) {
        for (const item of tx.items) {
            console.log(item);
        }
    }
})

export class ResourceTransactionPlugin extends EcsPlugin {
    add(app: PluginApp): void {
        app
            .registerEvent(ResourceTransactionEvent)
            .addSystem(ApplyTransactions)
    }
}