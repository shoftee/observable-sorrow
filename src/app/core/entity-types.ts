import { Ref } from "vue";

interface IState<TId> {
  readonly id: TId;
}

interface IMetadata<TId> {
  readonly id: TId;
}

interface IManager<
  TId extends string,
  TMeta extends IMetadata<TId>,
  TState extends IState<TId>,
> {
  getMeta(id: TId): TMeta;
  allMetas(): Iterable<TMeta>;

  getState(id: TId): Ref<TState>;
  allStates(): Ref<TState>[];
}

export {
  IState as IEntityState,
  IMetadata as IEntityMetadata,
  IManager as IEntityManager,
};
