import { EcsComponent } from "@/app/ecs";

const COMPONENT = Symbol();
export class SchemaComponent<C extends EcsComponent = EcsComponent> {
  [COMPONENT]!: C;
}

const ENTITY = Symbol();
export class SchemaEntity<T = unknown> {
  [ENTITY]!: T;
}

const EVENT = Symbol();
export class SchemaEvent<T = unknown> {
  [EVENT]!: T;
}
