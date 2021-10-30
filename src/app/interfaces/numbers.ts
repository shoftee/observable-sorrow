export type ShowSign = "remove" | "negative" | "always";
export type Formatter = (
  value: number,
  precision: number,
  showSign: ShowSign,
) => string;
