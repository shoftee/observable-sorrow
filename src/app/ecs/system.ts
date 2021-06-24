import { EntityAdmin } from "../game/entity-admin";
import { IUpdate } from "./lifecycle";

export abstract class System implements IUpdate {
  constructor(protected readonly admin: EntityAdmin) {}

  abstract update(dt: number): void;
}
