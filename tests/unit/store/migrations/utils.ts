import { UpgradeTransaction } from "@/app/store/schemas";

export function resolveWith<T>(value: T): Promise<T> {
  return new Promise((resolve) => resolve(value));
}

export function mockCursor<State, Schema>(handlers: {
  load(): State;
  save(state: State): void;
}): UpgradeTransaction<Schema> {
  return {
    objectStore() {
      return {
        openCursor() {
          return resolveWith({
            get value() {
              return handlers.load();
            },
            continue() {
              return resolveWith(undefined);
            },
            update(s: State) {
              handlers.save(s);
              return resolveWith(undefined);
            },
          });
        },
      };
    },
  } as unknown as UpgradeTransaction<Schema>;
}
