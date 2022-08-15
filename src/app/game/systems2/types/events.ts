import { EcsEvent } from "@/app/ecs";
import { TimeIntent } from "@/app/interfaces";

export class TimeEvent extends EcsEvent {
  constructor(readonly intent: TimeIntent) {
    super();
  }
}

type TransactionItem = {
  resource: string;
  type: "debit" | "credit";
  amount: number;
}

export class ResourceTransactionEvent extends EcsEvent {
  constructor(readonly items: TransactionItem[]) {
    super();
  }
}