type HistoryEventDisposition = "none" | "ignore";

type Named = { named?: Record<string, unknown> };
type AllEvents = { disposition?: HistoryEventDisposition };

type LabelEvent = { kind: "label"; label: string } & Named & AllEvents;
type PluralLabelEvent = {
  kind: "plural-label";
  label: string;
  plural: number;
} & Named &
  AllEvents;

export type HistoryEvent = LabelEvent | PluralLabelEvent;

export function label(
  label: string,
  named?: Record<string, unknown>,
): LabelEvent {
  return { kind: "label", label, named };
}

export function pluralLabel(
  label: string,
  plural: number,
  named?: Record<string, unknown>,
): PluralLabelEvent {
  return { kind: "plural-label", label, plural, named };
}
