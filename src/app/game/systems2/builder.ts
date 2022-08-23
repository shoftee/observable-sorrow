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
import {
  BuildingSetupPlugin,
  BuildingOrderPlugin,
  BuildingResolutionPlugin,
  FulfillmentSetupPlugin,
  FulfillmentResolutionPlugin,
} from "./fulfillment";

import { AggregateBuildingUnlocks } from "./core/unlock";

export function build(onRender: OnRenderHandler): GameRunner {
  return new App()
    .addPlugin(new MinimalPlugins())
    .addPlugin(new ResourceSetupPlugin())
    .addPlugin(new BuildingSetupPlugin())
    .addPlugin(new FulfillmentSetupPlugin())
    .addPlugin(new TimePlugin())
    .addPlugin(new EnvironmentPlugin())
    .addPlugin(new AstronomyPlugin())
    .addPlugin(new ResourceOrderPlugin())
    .addPlugin(new BuildingOrderPlugin())
    .addPlugin(new ResourceResolutionPlugin())
    .addPlugin(new BuildingResolutionPlugin())
    .addPlugin(new FulfillmentResolutionPlugin())
    .addSystem(AggregateBuildingUnlocks)
    .addPlugin(new RendererPlugin(onRender))
    .buildRunner();
}
