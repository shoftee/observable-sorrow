import { IEntity } from ".";
import { Resolver } from "../core";

export interface IInit {
  init(resolver: Resolver<IEntity>): void;
}

export interface IUpdate {
  update(deltaTime: number): void;
}

export interface IRender {
  render(): void;
}
