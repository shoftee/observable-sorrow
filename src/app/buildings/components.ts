import { QueueComponent } from "@/app/ecs";

interface BuildingCommand {
  intent: "construct" | "deconstruct";
}

export class BuildQueueComponent extends QueueComponent<BuildingCommand> {
  construct(): void {
    this.enqueue({ intent: "construct" });
  }

  consume(callback: (item: BuildingCommand) => void): void {
    super.consume(callback);
  }
}
