import { OnRenderHandler } from "@/app/interfaces";

import { GameRunner, App } from "@/app/ecs";

import { RendererPlugin } from "./renderer";
import { EnvironmentPlugin } from "./environment/plugin";
import { AstronomyPlugin } from "./astronomy/plugin";
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
import { EffectsSetupPlugin } from "./effects/setup";

export function build(onRender: OnRenderHandler): GameRunner {
  return new App()
    .addPlugin(new EffectsSetupPlugin())
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
