type Key = string | number | symbol;
type State = Record<Key, unknown>;
// eslint-disable-next-line
type Value = any;

export class ReactiveBag {
  private readonly items = new Map<Key, CacheEntry>();

  set(key: Key, value: Value): void {
    const existing = this.items.get(key);
    if (existing) {
      existing.value = value;
    } else {
      this.items.set(key, new CacheEntry(this.items, () => value));
    }
  }

  computed<TState extends State>(
    key: Key,
    calculate: (state: TState) => Value,
  ): void {
    const proxy = new Proxy<TState>({} as TState, {
      get: (_target, property, _receiver) => {
        // eslint-disable-next-line
        const item = this.item(property)!;
        item.dependentKeys.add(key);
        return item.value;
      },
    });
    this.items.set(key, new CacheEntry(this.items, () => calculate(proxy)));
  }

  fetch(key: Key): Value {
    // eslint-disable-next-line
    return this.item(key)!.value;
  }

  private item(key: Key): CacheEntry | undefined {
    return this.items.get(key);
  }
}

class CacheEntry {
  private v: Value;
  protected invalidated = true;
  readonly dependentKeys = new Set<Key>();

  constructor(
    private readonly items: Map<Key, CacheEntry>,
    private calculate: () => Value,
  ) {}

  get value(): Value {
    this.recalculate();
    return this.v;
  }

  set value(newValue: Value) {
    this.calculate = () => newValue;
    this.invalidate();
  }

  private invalidate(): void {
    this.invalidated = true;

    for (const dependent of this.dependents()) {
      dependent.invalidate();
    }
  }

  private recalculate() {
    if (!this.invalidated) {
      return;
    }

    this.v = this.calculate();
    this.invalidated = false;
  }

  private *dependents(): IterableIterator<CacheEntry> {
    for (const dependentKey of this.dependentKeys) {
      const dependent = this.items.get(dependentKey);
      if (dependent) {
        yield dependent;
      }
    }
  }
}
