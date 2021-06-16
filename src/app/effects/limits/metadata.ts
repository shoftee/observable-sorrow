import { IEntityMetadata } from "@/app/core/entity-types";

type Id = "catnip";

interface IMetadata extends IEntityMetadata<Id> {
  id: Id;
  base: number;
}

const Metadata: Record<Id, IMetadata> = {
  catnip: { id: "catnip", base: 5000 },
  // wood: { id: "wood", base: 200 },
  // minerals: { id: "minerals", base: 250 },
  // coal: { id: "coal", base: 60 },
  // iron: { id: "iron", base: 50 },
  // titanium: { id: "titanium", base: 2 },
  // gold: { id: "gold", base: 10 },
  // oil: { id: "oil", base: 1500 },
  // uranium: { id: "uranium", base: 250 },
  // unobtainium: { id: "unobtainium", base: 150 },
  // antimatter: { id: "antimatter", base: 100 },
  // catpower: { id: "catpower", base: 100 },
  // science: { id: "science", base: 250 },
  // culture: { id: "culture", base: 100 },
  // faith: { id: "faith", base: 100 },
};

export { Id as LimitedResourceId, IMetadata as ILimitMetadata, Metadata };
