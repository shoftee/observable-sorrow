export interface IInit {
  init(): void;
}

export interface IUpdate {
  update(deltaTime: number): void;
}

export interface IRender {
  render(): void;
}
