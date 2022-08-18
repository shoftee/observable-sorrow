import { ValueComponent } from "@/app/ecs";

export class Unlocked extends ValueComponent<boolean> {
  constructor(public value: boolean) {
    super();
  }
}
