import { EntityId, PooledEntityId } from "..";

export abstract class Entity {
  constructor(readonly id: EntityId) {}
}

export abstract class EntityPool {
  constructor(readonly id: PooledEntityId) {}
}
