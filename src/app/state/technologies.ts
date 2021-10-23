import { IngredientState, ResourcesType } from ".";
import { TechnologyId } from "../interfaces";

export type TechMetadataType = Readonly<{
  id: TechnologyId;
  label: string;
  description: string;
  flavor?: string;
  ingredients: ResourcesType;
  effects: TechEffectType[];
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
  },
};

export interface TechnologyState {
  unlocked: boolean;
  researched: boolean;
  ingredients: IngredientState[];
  fulfilled: boolean;
  capped: boolean;
}
