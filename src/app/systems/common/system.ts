import { EntityAdmin } from "../../entity";

export abstract class System {
  constructor(protected readonly admin: EntityAdmin) {}

  init?(): void;
  abstract update(): void;
}
