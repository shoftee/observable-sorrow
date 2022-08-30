import { OnRenderHandler } from "@/app/interfaces";

import { GameRunner, App } from "@/app/ecs";

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
import { UnlockResolutionPlugin } from "./unlock";

import { EffectsSetupPlugin } from "./effects/setup";
import { SectionResolutionPlugin, SectionSetupPlugin } from "./section";

export function build(onRender: OnRenderHandler): GameRunner {
  return new App()
    .addPlugin(new EffectsSetupPlugin())
    .addPlugin(new ResourceSetupPlugin())
    .addPlugin(new BuildingSetupPlugin())
    .addPlugin(new FulfillmentSetupPlugin())
    .addPlugin(new SectionSetupPlugin())
    .addPlugin(new TimePlugin())
    .addPlugin(new EnvironmentPlugin())
    .addPlugin(new AstronomyPlugin())
    .addPlugin(new ResourceOrderPlugin())
    .addPlugin(new BuildingOrderPlugin())
    .addPlugin(new ResourceResolutionPlugin())
    .addPlugin(new BuildingResolutionPlugin())
    .addPlugin(new FulfillmentResolutionPlugin())
    .addPlugin(new SectionResolutionPlugin())
    .addPlugin(new UnlockResolutionPlugin())
    .addPlugin(new RendererPlugin(onRender))
    .buildRunner();
}
