export enum Kind {
  Text = 0,
  Label = 1,
  PluralLabel = 2,
}

export enum Disposition {
  None = 0,
  Ignore = 1,
}

type Named = { named?: Record<string, unknown> };
type AllEvents = { disposition?: Disposition };

type Label = { kind: Kind.Label; label: string } & Named & AllEvents;
type PluralLabel = {
  kind: Kind.PluralLabel;
  label: string;
  plural: number;
} & Named &
  AllEvents;

export type HistoryEvent = Label | PluralLabel;

export function label(label: string): Label {
  return { kind: Kind.Label, label };
}

export function pluralLabel(label: string, plural: number): PluralLabel {
  return { kind: Kind.PluralLabel, label, plural };
}
