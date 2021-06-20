export type SystemType = "game" | "resources" | "environment" | "resource-list";
export interface ISystem {
  readonly type: SystemType;
}
