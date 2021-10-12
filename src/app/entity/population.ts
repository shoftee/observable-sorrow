import { reactive } from "vue";

import { SocietyState } from "@/_state/society";

import { Entity } from ".";

export class SocietyEntity extends Entity {
  readonly state: SocietyState;

  constructor() {
    super("society");

    this.state = reactive(new SocietyState());
  }
}
