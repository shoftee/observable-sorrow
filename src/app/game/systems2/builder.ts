import { OnRenderHandler } from "@/app/interfaces";

import { GameRunner, App } from "@/app/ecs";
import { MinimalPlugins } from "@/app/ecs/plugins";

import { RendererPlugin } from "./renderer";
import { EnvironmentPlugin } from "./environment";
import { AstronomyPlugin } from "./astronomy";
import { TimePlugin } from "./time";
import { ResourceTransactionPlugin } from "./resource-transaction";

export function build(onRender: OnRenderHandler): GameRunner {
  return new App()
    .addPlugin(new MinimalPlugins())
    .addPlugin(new TimePlugin())
    .addPlugin(new ResourceTransactionPlugin())
    .addPlugin(new EnvironmentPlugin())
    .addPlugin(new AstronomyPlugin())
    .addPlugin(new RendererPlugin(onRender))
    .buildRunner();
}
