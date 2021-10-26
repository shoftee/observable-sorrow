export enum Kind {
  Text = 0,
  Label = 1,
}

export type HistoryEvent =
  | { kind: Kind.Text; text: string }
  | { kind: Kind.Label; label: string };
