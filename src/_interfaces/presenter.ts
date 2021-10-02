export type PropertyBag = Record<string, unknown> | undefined;

export interface IPresenterSink {
  update(changes: Map<string, PropertyBag>): void;
}
