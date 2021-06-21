import { IEntity } from "./entity";

export interface IComponent {
  owner?: IEntity;
}

export type ComponentState<TComponent extends IComponent> = Omit<
  TComponent,
  keyof IComponent
>;

export abstract class Component implements IComponent {
  owner?: IEntity;
}
