import { Intent, OnRenderHandler } from "@/app/interfaces";

import { EcsEvent, GameRunner } from "../ecs";

import { build } from "./systems2/builder";
import { TimeEvent } from "./systems2/types";

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
      return new TimeEvent(intent);
    default:
      return undefined;
  }
}
