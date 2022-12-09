import { EcsComponent, MarkerComponent } from "@/app/ecs";

export class RareEvent extends MarkerComponent {}

export class Countdown extends EcsComponent {
  remaining: number;

  constructor(readonly start: number) {
    super();
    this.remaining = start;
  }

  reset() {
    this.remaining = this.start;
  }
}
