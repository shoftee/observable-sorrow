import { NumberEffectId } from "@/app/interfaces";

export type EffectState<T> = { value: T | undefined };

export class EffectTreeState extends Map<NumberEffectId, Set<NumberEffectId>> {}
