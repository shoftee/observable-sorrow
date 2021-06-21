import { Component } from "../ecs";
import { QueueComponent } from "../ecs/common/queue-component";

export class AmountComponent extends Component {
  unlocked = false;
  value = 0;
}

export class CapacityComponent extends Component {
  capacity = 0;
}

export class MutationComponent extends QueueComponent<number> {
  sum(): number {
    let total = 0;
    this.consume((item) => {
      total += item;
    });
    return total;
  }
}
