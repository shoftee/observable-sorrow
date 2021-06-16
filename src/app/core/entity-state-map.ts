import { asEnumerable } from "linq-es2015";
import { isReadonly, reactive, readonly, Ref, unref } from "vue";

import { IEntityState as IState } from "./entity-types";

interface IStateMap<TId extends string, TState extends IState<TId>> {
  all(): Ref<TState>[];
  get(id: TId): Ref<TState>;
}

abstract class Base<TId extends string, TState extends IState<TId>>
  implements IStateMap<TId, TState>
{
  protected readonly refs: Ref<TState>[];
  private readonly refCache = new Map<TId, Ref<TState>>();

  constructor(refs: Iterable<Ref<TState>>) {
    this.refs = Array.from(refs);
    this.refCache = asEnumerable(this.refs).ToDictionary(
      (e) => unref(e).id,
      (e) => e,
    );
  }

  all(): Ref<TState>[] {
    return this.refs;
  }

  get(id: TId): Ref<TState> {
    // eslint-disable-next-line
    return this.refCache.get(id)!;
  }
}

class Reactive<TId extends string, TState extends IState<TId>> extends Base<
  TId,
  TState
> {
  constructor(items: Iterable<TState>) {
    super(
      asEnumerable(items)
        .Select((e) => reactive<TState>(e))
        .Cast<Ref<TState>>(),
    );
  }

  readonly(): Readonly<TId, TState> {
    return new Readonly(this.refs);
  }
}

class Readonly<TId extends string, TState extends IState<TId>> extends Base<
  TId,
  TState
> {
  constructor(refs: Ref<TState>[]) {
    super(
      asEnumerable(refs)
        .Select((r) => (isReadonly(r) ? r : readonly(r)))
        .Cast<Ref<TState>>(),
    );
  }
}

export {
  IStateMap as IEntityStateMap,
  Reactive as ReactiveStateMap,
  Readonly as ReadonlyStateMap,
};
