import { asEnumerable } from "linq-es2015";
import { Ref, ref } from "vue";
import { ResourceId, ResourceMetadataType, ResourcePoolEntity } from ".";
import { IRender } from "../ecs";
import { IGame, IRegisterInGame } from "../systems/game";

export interface IResourcePresenter {
  readonly unlocked: Ref<IResourceListItemViewModel[]>;
}

export class ResourcePresenter
  implements IResourcePresenter, IRegisterInGame, IRender
{
  private pool!: ResourcePoolEntity;
  private metadata!: Record<ResourceId, ResourceMetadataType>;

  readonly unlocked: Ref<IResourceListItemViewModel[]>;

  constructor() {
    this.unlocked = ref([]) as Ref<IResourceListItemViewModel[]>;
  }

  register(game: IGame): void {
    this.metadata = game.metadata.resources;
    this.pool = game.resources;
  }

  render(): void {
    const unlocked = asEnumerable(this.pool.all((e) => e.amount.unlocked));
    const vms = unlocked
      .Select(
        (e) =>
          <IResourceListItemViewModel>{
            id: e.id,
            title: this.metadata[e.id].title,
            unlocked: e.amount.unlocked,
            amount: e.amount.value,
          },
      )
      .ToArray();
    this.unlocked.value = vms;
  }
}

export interface IResourceListItemViewModel {
  readonly id: string;
  title: string;
  amount: number;
  capacity?: number;
}
