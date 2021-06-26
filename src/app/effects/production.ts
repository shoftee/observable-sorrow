import { cloneDeep } from "lodash";
import {
  BuildingMetadata,
  ProductionEffectId,
  ProductionEffectType,
} from "../core/metadata";

import { Component, Entity } from "../ecs";
import { EntityAdmin } from "../game/entity-admin";

export class ProductionEffectEntity extends Entity {
  effect!: ProductionEffectsComponent;

  constructor(admin: EntityAdmin, readonly id: ProductionEffectId) {
    super(admin, id);
  }

  init(): void {
    this.effect = this.addComponent(new ProductionEffectsComponent());
  }
}

export class ProductionEffectsComponent extends Component {
  effects: ProductionEffectType[] = [];
}
