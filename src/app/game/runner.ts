export interface IGameRunner {
  start(): void;
  stop(): void;
  forceUpdate(): boolean;
}
