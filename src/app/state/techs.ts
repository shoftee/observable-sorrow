import { FulfillmentState, ResourcesType } from ".";
import { TechId } from "../interfaces";

export type TechMetadataType = Readonly<{
  id: TechId;
  label: string;
  description: string;
  flavor?: string;
  ingredients: ResourcesType;
  effects: TechEffectType[];
  dependsOn: TechId[];
}>;

export type TechEffectType = Readonly<{
  id: string;
  label: string;
}>;

export const TechMetadata: Record<TechId, TechMetadataType> = {
  calendar: {
    id: "calendar",
    label: "tech.calendar.label",
    description: "tech.calendar.description",
    flavor: "tech.calendar.flavor",
    ingredients: { science: 30 },
    effects: [{ id: "default", label: "tech.calendar.effect" }],
    dependsOn: [],
  },
  agriculture: {
    id: "agriculture",
    label: "tech.agriculture.label",
    description: "tech.agriculture.description",
    flavor: "tech.agriculture.flavor",
    ingredients: { science: 100 },
    effects: [{ id: "default", label: "tech.agriculture.effect" }],
    dependsOn: ["calendar"],
  },
};

export interface TechState extends FulfillmentState {
  unlocked: boolean;
  researched: boolean;
}
