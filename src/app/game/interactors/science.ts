import { IScienceInteractor, TechId } from "@/app/interfaces";
import { EntityAdmin, OrderStatus } from "../entity";

export class ScienceInteractor implements IScienceInteractor {
  constructor(private readonly admin: EntityAdmin) {}

  researchTech(id: TechId): void {
    const entity = this.admin.tech(id);
    if (entity.status === OrderStatus.EMPTY) {
      entity.status = OrderStatus.ORDERED;
    }
  }
}
