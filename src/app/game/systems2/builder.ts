import { OnRenderHandler } from "@/app/interfaces";

import { GameRunner, App } from "@/app/ecs";
import { MinimalPlugins } from "@/app/ecs/plugins";

import { RendererPlugin } from "./renderer";
import { EnvironmentPlugin } from "./environment";

export function build(onRender: OnRenderHandler): GameRunner {
  return new App()
    .addPlugin(new MinimalPlugins())
    .addPlugin(new EnvironmentPlugin())
    .addPlugin(new RendererPlugin(onRender))
    .buildRunner();
}
