import { BuildingId, JobId, RecipeId, TechId } from ".";

export type BonfireIntent = { kind: "bonfire" } & (
  | { id: "gather-catnip" }
  | { id: "observe-sky" }
);

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
  | BonfireIntent
  | ConstructionIntent
  | ResearchIntent
  | SocietyIntent
  | WorkshopIntent;
