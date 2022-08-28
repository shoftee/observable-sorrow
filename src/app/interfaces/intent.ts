import { BuildingId, JobId, RecipeId, TechId } from ".";

export type MetaIntent = { kind: "meta" } & { id: "save-game" };

export type TimeIntent = { kind: "time" } & (
  | { id: "pawse" }
  | { id: "unpawse" }
  | { id: "set-power"; power: number }
);

export type AstronomyIntent = { kind: "astronomy" } & { id: "observe-sky" };

export type BonfireIntent = { kind: "bonfire" } & { id: "gather-catnip" };

export type ConstructionIntent = { kind: "construction" } & {
  id: "buy-building";
  building: BuildingId;
};

export type WorkshopIntent = { kind: "workshop" } & {
  id: "craft-recipe";
  recipe: RecipeId;
};

export type ResearchIntent = { kind: "research" } & {
  id: "research-tech";
  tech: TechId;
};

export type SocietyIntent = { kind: "society" } & (
  | { id: "assign-job"; job: JobId }
  | { id: "unassign-job"; job: JobId }
);

export type Intent =
  | MetaIntent
  | TimeIntent
  | AstronomyIntent
  | BonfireIntent
  | ConstructionIntent
  | ResearchIntent
  | SocietyIntent
  | WorkshopIntent;
