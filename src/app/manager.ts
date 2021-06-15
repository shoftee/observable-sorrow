import { EntityStateMap } from "./core/entity";
import { Id as ResourceId } from "./resources/types";
import { State as ResourceState } from "./resources/state";

export class StateManager {
    private _resources: EntityStateMap<ResourceId, ResourceState>;

    constructor() {
        this._resources = new EntityStateMap([new ResourceState()]);
    }

    resources(): EntityStateMap<ResourceId, ResourceState> {
        return this._resources;
    }
}