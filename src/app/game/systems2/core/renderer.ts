import { Constructor as Ctor } from "@/app/utils/types";

import { EcsComponent, EcsResource, World } from "@/app/ecs";
import {
  All,
  AllParams,
  AllResults,
  ChangeTrackers,
  Query,
  Res,
} from "@/app/ecs/query";
import { InstantiatedQuery } from "@/app/ecs/query/types";
import { System } from "@/app/ecs/system";

import {
  DeltaSchema,
  RemovedDeltaSchema,
  EventsSchema,
  StateSchema,
  visitState,
} from "./deltas";

export class ComponentDeltas {
  added: DeltaSchema = {};
  changed: DeltaSchema = {};
  removed: RemovedDeltaSchema = {};
  events: EventsSchema = {};

  clear() {
    this.added = {};
    this.changed = {};
    this.removed = {};
    this.events = {};
  }

  setAdded(fn: (root: StateSchema) => void) {
    visitState(this.added as StateSchema, fn);
  }

  setChanged(fn: (root: StateSchema) => void) {
    visitState(this.changed as StateSchema, fn);
  }

  setRemoved(fn: (root: RemovedDeltaSchema) => void) {
    visitState(this.removed, fn);
  }
}

export class DeltaBuffer extends EcsResource {
  readonly components: ComponentDeltas = new ComponentDeltas();
}

type SchemaStateExtractor<S, Q extends AllParams> = (
  schema: StateSchema,
  results: AllResults<Q>,
) => S;

type StateExtractor<S> = (schema: StateSchema) => S;

function SchemaExtratorQuery<Q extends AllParams>(...qs: Q) {
  return <S>(extractor: SchemaStateExtractor<S, Q>) => {
    const descriptor = All(...qs);
    return {
      newQuery(world: World): InstantiatedQuery<StateExtractor<S>> {
        const query = descriptor.newQuery(world);
        return {
          includes(ctx) {
            return query.includes(ctx);
          },
          matches(ctx) {
            return query.matches(ctx);
          },
          fetch(ctx) {
            return (schema) => extractor(schema, query.fetch(ctx));
          },
          cleanup() {
            query.cleanup();
          },
        };
      },
    };
  };
}

const R_DeltaBuffer = Res(DeltaBuffer);

type MutatorFn<S, C extends EcsComponent> = (state: S, tracked: C) => void;

export function DeltaExtractor<Q extends AllParams>(...stateQuery: Q) {
  return <S>(schemaExtractor: SchemaStateExtractor<S, Q>) => {
    return <C extends EcsComponent>(
      tracked: Ctor<C>,
      mutator: MutatorFn<S, C>,
    ) => {
      return System(
        R_DeltaBuffer,
        Query(
          ChangeTrackers(tracked),
          SchemaExtratorQuery(...stateQuery)(schemaExtractor),
        ),
      )(({ components }, trackers) => {
        for (const [tracker, extractor] of trackers) {
          if (tracker.isAdded()) {
            components.setAdded((root) =>
              mutator(extractor(root), tracker.value()),
            );
          } else if (tracker.isChanged()) {
            components.setChanged((root) =>
              mutator(extractor(root), tracker.value()),
            );
          }
        }
      });
    };
  };
}
