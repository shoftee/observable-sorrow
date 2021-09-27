import { EffectId, ResourceId } from "./_id";

export interface Modifier {
  id: EffectId;
  apply(accumulator: number, value: number): number;
}

export enum ValueKind {
  Base = 1,
  Variable = 2,
  Compound = 3,
}

class Addition implements Modifier {
  constructor(readonly id: EffectId) {}

  apply(accumulator: number, value: number): number {
    return accumulator + value;
  }
}

export function AdditionModifier(id: EffectId): Addition {
  return new Addition(id);
}

class Ratio implements Modifier {
  constructor(readonly id: EffectId) {}

  apply(accumulator: number, value: number): number {
    return accumulator * (1 + value);
  }
}

export function ProportionalModifier(id: EffectId): Ratio {
  return new Ratio(id);
}

class Multiplication implements Modifier {
  constructor(readonly id: EffectId) {}

  apply(accumulator: number, value: number): number {
    return accumulator * value;
  }
}

export function MultiplicationModifier(id: EffectId): Multiplication {
  return new Multiplication(id);
}

export type EffectValueType =
  | { kind: ValueKind.Base; value: number }
  | { kind: ValueKind.Variable }
  | {
      kind: ValueKind.Compound;
      effects: [Addition, ...Modifier[]];
    };

export type EffectMetadataType = {
  id: EffectId;
  value: EffectValueType;
};

export type ResourceQuantityType = {
  id: ResourceId;
  amount: number;
};

export type EffectQuantityType = {
  id: EffectId;
  amount: number;
};

export function BaseEffect(value: number): EffectValueType {
  return { kind: ValueKind.Base, value };
}

export function VariableEffect(): EffectValueType {
  return { kind: ValueKind.Variable };
}

export function CompoundEffect(
  assignment: Addition,
  ...modifiers: Modifier[]
): EffectValueType {
  return { kind: ValueKind.Compound, effects: [assignment, ...modifiers] };
}
