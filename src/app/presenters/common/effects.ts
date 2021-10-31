import { NumberView } from "..";

export interface EffectItem {
  id: string;
  label: string;
  singleAmount: NumberView | undefined;
  totalAmount: NumberView | undefined;
}
