import { ISocietyInteractor, JobId } from "@/app/interfaces";

import { EntityAdmin } from "../entity";

export class SocietyInteractor implements ISocietyInteractor {
  constructor(private readonly admin: EntityAdmin) {}

  assignJob(id: JobId): void {
    const pop = this.admin.pops().withJob(undefined).first();
    pop.state.job = id;
  }

  unassignJob(id: JobId): void {
    const pop = this.admin.pops().withJob(id).first();
    pop.state.job = undefined;
  }
}
