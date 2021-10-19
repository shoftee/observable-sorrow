export type ShowSign = "remove" | "negative" | "always";

export interface INumberNotation {
  number(value: number, precision: number, showSign: ShowSign): string;
}
