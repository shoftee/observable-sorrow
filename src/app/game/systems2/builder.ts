import { OnMutationHandler, OnEventHandler } from "@/app/interfaces";

import { GameRunner, App } from "@/app/ecs";
import { TimePlugin } from "@/app/ecs/time-plugin";

import { RendererPlugin } from "./renderer";
import { EnvironmentPlugin } from "./environment";

export function build(
  onMutation: OnMutationHandler,
  onLogEvent: OnEventHandler,
): GameRunner {
  return new App()
    .plugin(new TimePlugin())
    .plugin(new EnvironmentPlugin())
    .plugin(new RendererPlugin(onMutation, onLogEvent))
    .buildRunner();
}
