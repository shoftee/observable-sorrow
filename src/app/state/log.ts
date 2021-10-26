export enum Kind {
  Text = 0,
  Label = 1,
  CountLabel = 2,
}

export type HistoryEvent =
  | { kind: Kind.Text; text: string }
  | { kind: Kind.Label; label: string; data?: Record<string, unknown> }
  | {
      kind: Kind.CountLabel;
      label: string;
      count: number;
      data?: Record<string, unknown>;
    };
