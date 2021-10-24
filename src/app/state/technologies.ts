import { FulfillmentState, ResourcesType } from ".";
import { TechnologyId } from "../interfaces";

export type TechMetadataType = Readonly<{
  id: TechnologyId;
  label: string;
  description: string;
  flavor?: string;
  ingredients: ResourcesType;
  effects: TechEffectType[];
  dependsOn: TechnologyId[];
}>;

export type TechEffectType = Readonly<{
  id: string;
  label: string;
}>;

export const TechMetadata: Record<TechnologyId, TechMetadataType> = {
  calendar: {
    id: "calendar",
    label: "technology.calendar.label",
    description: "technology.calendar.description",
    flavor: "technology.calendar.flavor",
    ingredients: { science: 30 },
    effects: [{ id: "default", label: "technology.calendar.effect" }],
    dependsOn: [],
  },
  agriculture: {
    id: "agriculture",
    label: "technology.agriculture.label",
    description: "technology.agriculture.description",
    flavor: "technology.agriculture.flavor",
    ingredients: { science: 100 },
    effects: [{ id: "default", label: "technology.agriculture.effect" }],
    dependsOn: ["calendar"],
  },
};

export interface TechnologyState extends FulfillmentState {
  unlocked: boolean;
  researched: boolean;
}
