import { EcsPlugin, PluginApp } from "@/app/ecs";
import { Value } from "@/app/ecs/query";

import { DeltaExtractor } from "../core";
import { Unlocked } from "../unlock/types";
import { AlertLabel, Section, Title } from "./types";

const SectionExtractor = DeltaExtractor(Value(Section))(
  (schema, [id]) => schema.sections[id],
);
const Extractors = [
  SectionExtractor(Unlocked, (state, unlocked) => {
    state.unlocked = unlocked.value;
  }),
  SectionExtractor(Title, (state, title) => {
    state.title = title.value;
  }),
  SectionExtractor(AlertLabel, (state, alert) => {
    state.alert = alert.value;
  }),
];

export class SectionResolutionPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addSystems(Extractors, { stage: "last-start" });
  }
}
