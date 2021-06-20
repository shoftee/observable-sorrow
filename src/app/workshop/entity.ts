import { Queue } from "queue-typescript";
import { Component, Entity, IEntity } from "../ecs";
import { QueueComponent } from "../ecs/common/queue-component";
import { RecipeId, RecipeMetadataType } from "./metadata";

export class WorkshipEntity implements IEntity {
  readonly id = "workshop";
}

export class RecipeEntity extends Entity {
  readonly id: RecipeId;

  constructor(metadata: RecipeMetadataType) {
    super();
    this.id = metadata.id;
  }

  init(): void {
    //
  }

  update(deltaTime: number): void {
    //
  }
}

export class RecipeInputComponent extends QueueComponent<RecipeId> {}
