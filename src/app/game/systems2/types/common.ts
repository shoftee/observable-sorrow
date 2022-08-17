import { EcsComponent } from "@/app/ecs";

export class Unlock extends EcsComponent {
  constructor(public unlocked: boolean) {
    super();
  }
}
