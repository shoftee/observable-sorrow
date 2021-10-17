import { JobId } from "@/_interfaces";

import { EntityAdmin } from "../entity";
import { ISocietyInteractor } from "../game/endpoint";

export class SocietyInteractor implements ISocietyInteractor {
  constructor(private readonly admin: EntityAdmin) {}

  assignJob(id: JobId): void {
    const pop = this.admin.pops().unemployed().first();
    pop.state.job = id;
  }

  unassignJob(id: JobId): void {
    const pop = this.admin.pops().withJob(id).first();
    pop.state.job = undefined;
  }
}
