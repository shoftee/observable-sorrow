import { IScienceInteractor, TechnologyId } from "@/app/interfaces";
import { EntityAdmin, OrderStatus } from "../entity";

export class ScienceInteractor implements IScienceInteractor {
  constructor(private readonly admin: EntityAdmin) {}

  researchTechnology(id: TechnologyId): void {
    const entity = this.admin.technology(id);
    if (entity.status === OrderStatus.EMPTY) {
      entity.status = OrderStatus.ORDERED;
    }
  }
}
