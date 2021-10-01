export type PropertyBag = Record<string, unknown> | undefined;

export interface IPresenter {
  update(changes: Map<string, unknown>): void;
}
