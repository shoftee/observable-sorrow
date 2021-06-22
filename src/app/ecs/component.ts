import { Entity } from "./entity";

export interface IComponent {
  owner?: Entity;
}

export type ComponentState<TComponent extends IComponent> = Omit<
  TComponent,
  keyof IComponent
>;

export abstract class Component implements IComponent {
  owner?: Entity;
}
