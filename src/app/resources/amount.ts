import { Component } from "../ecs";

export class AmountComponent extends Component {
  unlocked: boolean = false;
  value: number = 0;
}

export class CapacityComponent extends Component {
  capacity: number = 0;
}
