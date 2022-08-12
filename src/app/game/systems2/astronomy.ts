import { App, EcsPlugin } from "@/app/ecs";
import { Commands } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { RareEventMarker } from "./types";

const Setup = System(Commands())((cmds) => {
  cmds.spawn(new RareEventMarker());
});

export class AstronomyPlugin extends EcsPlugin {
  add(app: App): void {
    app.addStartupSystem(Setup);
  }
}
