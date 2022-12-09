import { SectionId } from "@/app/interfaces";

import { Predicate } from "@/app/ecs/query";

import { Section } from "./types";

export function SectionPredicate(id: SectionId) {
  return Predicate(Section, (s) => s.value === id);
}
