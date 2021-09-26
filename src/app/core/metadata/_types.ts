import { EffectId, ResourceId } from "./_id";

export enum ModifierKind {
  Absolute = 1,
  Proportional = 2,
  Multiplication = 3,
}

export enum ValueKind {
  Preset = 1,
  Base = 2,
  Variable = 3,
  Compound = 4,
}

export type ModifierType = {
  id: EffectId;
  kind: ModifierKind;
};

export function AbsoluteModifier(id: EffectId): ModifierType {
  return { id, kind: ModifierKind.Absolute };
}

export function ProportionalModifier(id: EffectId): ModifierType {
  return { id, kind: ModifierKind.Proportional };
}

export function MultiplicationModifier(id: EffectId): ModifierType {
  return { id, kind: ModifierKind.Multiplication };
}

export type EffectValueType =
  | { kind: ValueKind.Preset; value: number }
  | { kind: ValueKind.Base; value: number }
  | { kind: ValueKind.Variable }
  | {
      kind: ValueKind.Compound;
      effects: [ModifierType, ...ModifierType[]];
    };

export type EffectMetadataType = {
  id: EffectId;
  value: EffectValueType;
};

export type ResourceQuantityType = {
  id: ResourceId;
  amount: number;
};

export function PresetEffect(value: number): EffectValueType {
  return { kind: ValueKind.Preset, value };
}

export function BaseEffect(value: number): EffectValueType {
  return { kind: ValueKind.Base, value };
}

export function VariableEffect(): EffectValueType {
  return { kind: ValueKind.Variable };
}

export function CompoundEffect(
  effect: ModifierType,
  ...more: ModifierType[]
): EffectValueType {
  return { kind: ValueKind.Compound, effects: [effect, ...more] };
}
