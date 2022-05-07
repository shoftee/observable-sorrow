import { EcsComponent } from "@/app/ecs";

export const ResourceMarker = class extends EcsComponent {};

export class Resource extends EcsComponent {
  amount = 0;
}
