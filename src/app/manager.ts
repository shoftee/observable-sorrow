import EntityRefCollection, { IEntityRefCollection } from "./entity";
import { Id as ResourceId, Resource } from "./resource";

export class EntityManager {
    private _resources: IEntityRefCollection<ResourceId, Resource>;

    constructor() {
        this._resources = new EntityRefCollection([new Resource()]);
    }

    resources(): IEntityRefCollection<ResourceId, Resource> {
        return this._resources;
    }
}