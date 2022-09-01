import { Constructor as Ctor } from "@/app/utils/types";

import { EcsComponent, EcsResource, World } from "@/app/ecs";
import { All, ChangeTrackers, Query, Res } from "@/app/ecs/query";
import {
  EntityQuery,
  EntityQueryFactoryTuple,
  EntityQueryResultTuple,
} from "@/app/ecs/query/types";
import { System } from "@/app/ecs/system";

import {
  DeltaSchema,
  RemovedDeltaSchema,
  EventSources,
  StateSchema,
  visitState,
  getEventSinkPusher,
} from "./deltas";

export class ComponentDeltas {
  added: DeltaSchema = {};
  changed: DeltaSchema = {};
  removed: RemovedDeltaSchema = {};
  events: EventSources = {};

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

  pushEvents() {
    return getEventSinkPusher(this.events);
  }
}

export class DeltaBuffer extends EcsResource {
  readonly components: ComponentDeltas = new ComponentDeltas();
}

type SchemaStateExtractor<S, Q extends EntityQueryFactoryTuple> = (
  schema: StateSchema,
  results: EntityQueryResultTuple<Q>,
) => S;

type StateExtractor<S> = (schema: StateSchema) => S;

function SchemaExtractorQuery<Q extends EntityQueryFactoryTuple>(...qs: Q) {
  return <S>(extractor: SchemaStateExtractor<S, Q>) => {
    const descriptor = All(...qs);
    return {
      newQuery(world: World): EntityQuery<StateExtractor<S>> {
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

export function DeltaExtractor<Q extends EntityQueryFactoryTuple>(
  ...stateQuery: Q
) {
  return <S>(schemaExtractor: SchemaStateExtractor<S, Q>) => {
    return <C extends EcsComponent>(
      tracked: Ctor<C>,
      mutator: MutatorFn<S, C>,
    ) => {
      return System(
        R_DeltaBuffer,
        Query(
          ChangeTrackers(tracked),
          SchemaExtractorQuery(...stateQuery)(schemaExtractor),
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
