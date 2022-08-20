import {
  BonfireIntent,
  Intent,
  OnRenderHandler,
  WorkshopIntent,
} from "@/app/interfaces";

import { EcsEvent, GameRunner } from "../ecs";
import { Meta, ResourceMap } from "../state";

import { build } from "./systems2/builder";
import * as events from "./systems2/types/events";

export class Game {
  readonly runner: GameRunner;

  private handle?: number;

  constructor(onRender: OnRenderHandler) {
    this.runner = build(onRender);
  }

  start(): void {
    if (this.handle !== undefined) {
      throw new Error("Runner already started.");
    }
    const update = this.runner.start();
    update();
    this.handle = setInterval(() => update(), 50);
  }

  stop(): void {
    if (this.handle === undefined) {
      throw new Error("Runner not started.");
    }
    clearInterval(this.handle);
    this.handle = undefined;
  }

  dispatch(intent: Intent): void {
    const event = convertToEvent(intent);
    if (event === undefined) {
      console.log("Could not parse intent", intent);
    } else {
      this.runner.dispatch(event);
    }
  }
}

function convertToEvent(intent: Intent): EcsEvent | undefined {
  switch (intent.kind) {
    case "time":
      return new events.TimeOptionsChanged(intent);
    case "bonfire":
      return convertBonfireIntent(intent);
    case "workshop":
      return convertWorkshopIntent(intent);
  }
}

function convertBonfireIntent(intent: BonfireIntent): EcsEvent | undefined {
  if (intent.id === "gather-catnip") {
    return new events.ResourceOrder(ResourceMap.fromObject({ catnip: 1 }));
  }
}

function convertWorkshopIntent(intent: WorkshopIntent): EcsEvent | undefined {
  if (intent.id === "craft-recipe") {
    const { products, ingredients } = Meta.recipe(intent.recipe);
    return new events.ResourceOrder(
      ResourceMap.fromObject(products),
      ResourceMap.fromObject(ingredients),
    );
  }
}
