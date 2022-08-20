import { OnRenderHandler } from "@/app/interfaces";

import { GameRunner, App } from "@/app/ecs";
import { MinimalPlugins } from "@/app/ecs/plugins";

import { RendererPlugin } from "./renderer";
import { EnvironmentPlugin } from "./environment";
import { AstronomyPlugin } from "./astronomy";
import { TimePlugin } from "./time";
import {
  ResourceSetupPlugin,
  ResourceOrderPlugin,
  ResourceResolutionPlugin,
} from "./resource";
import { UnlocksPlugin } from "./unlocks";
import {
  FulfillmentSetupPlugin,
  FulfillmentResolutionPlugin,
} from "./fulfillment";

export function build(onRender: OnRenderHandler): GameRunner {
  return new App()
    .addPlugin(new MinimalPlugins())
    .addPlugin(new ResourceSetupPlugin())
    .addPlugin(new FulfillmentSetupPlugin())
    .addPlugin(new TimePlugin())
    .addPlugin(new ResourceOrderPlugin())
    .addPlugin(new EnvironmentPlugin())
    .addPlugin(new AstronomyPlugin())
    .addPlugin(new ResourceResolutionPlugin())
    .addPlugin(new FulfillmentResolutionPlugin())
    .addPlugin(new UnlocksPlugin())
    .addPlugin(new RendererPlugin(onRender))
    .buildRunner();
}
