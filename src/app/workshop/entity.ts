import { Entity, IUpdate } from "../ecs";
import { QueueComponent } from "../ecs/common/queue-component";
import { ResourcePool } from "../resources";
import { RecipeId, RecipeMetadataType } from "./metadata";

export const WorkshopSymbol = Symbol("Workshop");

export interface IWorkshop extends IUpdate {
  order(id: RecipeId): void;
}

export class Workshop extends Entity implements IWorkshop {
  readonly id = "workshop";

  private readonly orders: RecipeInputComponent;

  constructor(private resources: ResourcePool) {
    super();

    this.orders = this.addComponent(new RecipeInputComponent());
  }

  order(id: RecipeId): void {
    this.orders.enqueue(id);
  }

  update(_deltaTime: number): void {
    this.orders.consume((id) => this.build(id));
  }

  private build(id: RecipeId) {
    if (id == "gather-catnip") {
      const catnip = this.resources.get("catnip");
      if (catnip) {
        catnip.mutations.enqueue(1);
      }
    }
  }
}

export class RecipeEntity extends Entity {
  readonly id: RecipeId;

  readonly inputs: RecipeInputComponent;

  constructor(private resources: ResourcePool, metadata: RecipeMetadataType) {
    super();
    this.id = metadata.id;

    this.inputs = this.components.add(new RecipeInputComponent());
  }

  update(_deltaTime: number): void {
    this.inputs.consume((item) => {
      switch (item) {
        case "gather-catnip": {
          const entity = this.resources.get("catnip")!;
          entity.mutations.enqueue(1);
        }
      }
    });
  }
}

export class RecipeInputComponent extends QueueComponent<RecipeId> {}
