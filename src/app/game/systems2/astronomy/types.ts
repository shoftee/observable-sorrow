import { EcsComponent } from "@/app/ecs";

export const RareEvent = class extends EcsComponent {};

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
