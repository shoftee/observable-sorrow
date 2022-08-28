import { NumberEffectId } from "@/app/interfaces";

export type NumberEffectSchema = {
  value: number | undefined;
  references: NumberEffectId[];
};
