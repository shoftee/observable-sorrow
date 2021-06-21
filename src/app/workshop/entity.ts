import { Resolver } from "../core";
import { Entity, IEntity } from "../ecs";
import { QueueComponent } from "../ecs/common/queue-component";
import { ResourcePoolEntity } from "../resources";
import { RecipeId, RecipeMetadataType } from "./metadata";

export class WorkshopEntity extends Entity {
  readonly id = "workshop";

  private readonly orders: RecipeInputComponent;

  constructor() {
    super();
    this.orders = this.addComponent(new RecipeInputComponent());
  }

  private resources!: ResourcePoolEntity;

  init(resolver: Resolver<IEntity>): void {
    this.resources = resolver.get("resource-pool", ResourcePoolEntity);
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

  order(id: RecipeId): void {
    this.orders.enqueue(id);
  }
}

export class RecipeEntity extends Entity {
  readonly id: RecipeId;

  readonly inputs: RecipeInputComponent;

  constructor(metadata: RecipeMetadataType) {
    super();
    this.id = metadata.id;

    this.inputs = this.components.add(new RecipeInputComponent());
  }

  private resources!: ResourcePoolEntity;

  init(resolver: Resolver<IEntity>): void {
    this.resources = resolver.get("resource-pool", ResourcePoolEntity);
  }

  update(_deltaTime: number): void {
    this.inputs.consume((item) => {
      switch (item) {
        case "gather-catnip": {
          const entity = this.resources.get("catnip")!;
          console.log(entity);
          entity.mutations.enqueue(1);
        }
      }
    });
  }
}

export class RecipeInputComponent extends QueueComponent<RecipeId> {}
