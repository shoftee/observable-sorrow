import { NumberEffectId } from "@/app/interfaces";

import { EcsEntity, EcsPlugin, PluginApp } from "@/app/ecs";
import {
  WorldCmds,
  EntityCmds,
  Commands,
  Value,
  Tuple,
  Read,
  Added,
  Children,
  Eager,
  Entity,
  EntityMapQuery,
  Has,
  MapQuery,
  Mut,
  Opt,
  Query,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaExtractor } from "../core";

import {
  NumberValue,
  NumberEffect,
  NumberExprs,
  EffectCompositeItem,
  Effect,
  EffectTree,
  Reference,
} from "./types";
import { EffectValueResolver } from "./ecs";
import { untuple } from "@/app/utils/collections";

function* numberComponents(id?: NumberEffectId) {
  yield new Effect();
  if (id) {
    yield new NumberEffect(id);
    yield new EffectTree();
  }
  yield new NumberValue();
}

function addEffectComponents(
  cmds: WorldCmds,
  container: EntityCmds,
  item: EffectCompositeItem,
) {
  if (item instanceof Function) {
    const expr = item;
    container.defer((e) => {
      const innerContainer = cmds.spawnChild(e, ...numberComponents());
      for (const innerItem of expr()) {
        addEffectComponents(cmds, innerContainer, innerItem);
      }
    });
  } else {
    container.insert(item);
  }
}

const SpawnEffects = System(Commands())((cmds) => {
  for (const [id, expr] of Object.entries(NumberExprs)) {
    const current = cmds.spawn(...numberComponents(id as NumberEffectId));
    for (const item of expr()) {
      addEffectComponents(cmds, current, item);
    }
  }
});

const InitializeEffectValues = System(
  Query(Entity(), Has(Effect)),
  EffectValueResolver(),
)((lookup, resolver) => {
  resolver.resolveByEntities(untuple(lookup));
});

const CollectEffectTrees = System(
  MapQuery(
    Value(NumberEffect),
    Tuple(Entity(), Mut(EffectTree)),
    Added(NumberEffect),
  ),
  EntityMapQuery(Opt(Read(Reference)), Eager(Children()), Has(Effect)),
)((ids, effects) => {
  for (const [entity, { references }] of ids.values()) {
    collectReferences(
      { collected: references, get: (e) => effects.get(e) },
      entity,
    );
  }
});

type CollectCtx = {
  collected: Set<NumberEffectId>;
  get: (
    entity: EcsEntity,
  ) => [Readonly<Reference> | undefined, EcsEntity[]] | undefined;
};

function collectReferences(ctx: CollectCtx, current: EcsEntity) {
  const [ref, children] = ctx.get(current)!;
  if (ref) {
    ctx.collected.add(ref.value);
  } else {
    for (const child of children) {
      collectReferences(ctx, child);
    }
  }
}

const NumberExtractor = DeltaExtractor(Value(NumberEffect))(
  (schema, [id]) => schema.numbers[id],
);

const EffectTreeExtractor = DeltaExtractor(
  Tuple(Value(NumberEffect), Added(EffectTree)),
)((schema, [[id]]) => schema.numbers[id]);

const Extractors = [
  NumberExtractor(NumberValue, (effect, { value }) => {
    effect.value = value;
  }),
  EffectTreeExtractor(EffectTree, (effect, { references }) => {
    effect.references = Array.from(references);
  }),
];

export class EffectsSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addStartupSystem(SpawnEffects)
      .addSystems([InitializeEffectValues, CollectEffectTrees], {
        stage: "startup-end",
      })
      .addSystems(Extractors, { stage: "last-start" });
  }
}
