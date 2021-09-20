import { EntityAdmin } from "../game/entity-admin";

export abstract class System {
  constructor(protected readonly admin: EntityAdmin) {}

  abstract update(): void;
}
