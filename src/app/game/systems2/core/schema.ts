import { EcsComponent } from "@/app/ecs";

const ComponentSym = Symbol();
export class SchemaComponent<C extends EcsComponent = EcsComponent> {
  [ComponentSym]!: C;
}

const EntitySym = Symbol();
export class SchemaEntity<T = unknown> {
  [EntitySym]!: T;
}
