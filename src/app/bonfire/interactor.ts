import { IGameRunner } from "../game";
import { Workshop } from "../workshop/entity";
import {
  BonfireItemId,
  BonfireMetadata,
  BonfireMetadataType,
} from "./metadata";

export interface IBonfireInteractor {
  buildRecipe(id: BonfireItemId): void;
}

export class BonfireInteractor implements IBonfireInteractor {
  private readonly metadata: Record<BonfireItemId, BonfireMetadataType>;

  constructor(
    private readonly workshop: Workshop,
    private readonly runner: IGameRunner,
  ) {
    this.metadata = BonfireMetadata;
  }

  buildRecipe(id: BonfireItemId): void {
    this.workshop.order(this.metadata[id].recipeId);
    this.runner.forceUpdate();
  }
}
