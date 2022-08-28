import { EcsEntity, EcsPlugin, PluginApp } from "@/app/ecs";
import {
  WorldCmds,
  EntityCmds,
  Commands,
  Value,
  All,
  Read,
  Added,
  Children,
  Eager,
  Entity,
  EntityMapQuery,
  Every,
  MapQuery,
  Mut,
  Opt,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { NumberEffectId } from "@/app/interfaces";

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
    container.entity((e) => {
      const innerContainer = cmds.spawnChild(e, ...numberComponents());
      for (const innerItem of expr()) {
        addEffectComponents(cmds, innerContainer, innerItem);
      }
    });
  } else {
    container.insert(item);
  }
}

const Setup = System(Commands())((cmds) => {
  for (const [id, expr] of Object.entries(NumberExprs)) {
    const current = cmds.spawn(...numberComponents(id as NumberEffectId));
    for (const item of expr()) {
      addEffectComponents(cmds, current, item);
    }
  }
});

const CollectEffectTrees = System(
  MapQuery(Value(NumberEffect), All(Entity(), Mut(EffectTree))).filter(
    Added(NumberEffect),
  ),
  EntityMapQuery(Opt(Read(Reference)), Eager(Children())).filter(Every(Effect)),
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
  All(Value(NumberEffect)).filter(Added(EffectTree)),
)((schema, [[id]]) => schema.numbers[id]);

const DeltaExtractors = [
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
      .addStartupSystem(Setup)
      .addSystem(CollectEffectTrees, { stage: "startup-end" })
      .addSystems(DeltaExtractors, { stage: "last-start" });
  }
}
