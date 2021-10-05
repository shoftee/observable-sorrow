import { BuildingId } from "@/_interfaces";
import {
  BonfireMetadata,
  BonfireMetadataType,
  BuildingMetadata,
  BuildingMetadataType,
} from "@/_state";
import { Enumerable } from "@/_utils/enumerable";

class MetadataPresenter {
  bonfireItems(): Enumerable<BonfireMetadataType> {
    const values = Object.values(BonfireMetadata);
    return Enumerable.fromIterable(values);
  }

  buildings(): Enumerable<BuildingMetadataType> {
    const values = Object.values(BuildingMetadata);
    return Enumerable.fromIterable(values);
  }

  building(id: BuildingId): BuildingMetadataType {
    return BuildingMetadata[id];
  }
}

export const Metadata = new MetadataPresenter();
