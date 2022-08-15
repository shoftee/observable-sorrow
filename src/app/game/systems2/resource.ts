import { EcsPlugin, PluginApp } from "@/app/ecs";
import { Commands } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { Name, Resource, ResourceMarker } from "./types";

const ResourceSetup = System(Commands())(cmds => {
    for (const name of ["catnip"]) {
        cmds.spawn(new ResourceMarker(), new Name(name), new Resource());        
    }
})

export class ResourceSetupPlugin extends EcsPlugin {
    add(app: PluginApp): void {
        app
            .addStartupSystem(ResourceSetup)
    }
}