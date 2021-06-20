import { Ref, ref, unref } from "vue";
import { ResourceId, ResourceMetadataType, ResourcePoolEntity } from ".";
import { IRender } from "../ecs";
import { IGame, IRegisterInGame } from "../game";
import { ResourceEntity } from "./entity";

export interface IResourcePresenter {
  readonly unlocked: Ref<ListItem[]>;
}

export class ResourcePresenter
  implements IResourcePresenter, IRegisterInGame, IRender
{
  private pool!: ResourcePoolEntity;
  private metadata!: Record<ResourceId, ResourceMetadataType>;

  readonly unlocked: Ref<ListItem[]>;

  constructor() {
    this.unlocked = ref([]) as Ref<ListItem[]>;
  }

  register(game: IGame): void {
    this.metadata = game.metadata.resources;
    this.pool = game.resources;
  }

  render(): void {
    const vm = unref(this.unlocked);

    // Apply additions/deletions to view model.
    this.pool.changes.applyChanges({
      add: (id) => {
        // todo: consider order
        const entity = this.pool.get(id);
        if (entity && this.isUnlocked(entity)) {
          vm.push(this.newListItem(entity));
        }
      },
      delete: (id) => {
        const index = vm.findIndex((item) => item.id == id);
        vm.splice(index, 1);
      },
    });

    // update resource properties
    for (let item of vm) {
      const entity = this.pool.get(item.id);
      if (entity) {
        ({ ...item } = { ...this.newListItem(entity) });
      }
    }
    for (let index = 0; index < vm.length; index++) {
      let item = vm[index];
    }
  }

  private isUnlocked(e: ResourceEntity): boolean {
    return e.amount.unlocked;
  }

  private newListItem(e: ResourceEntity) {
    return <ListItem>{
      id: e.id,
      title: this.metadata[e.id].title,
      unlocked: e.amount.unlocked,
      amount: e.amount.value,
    };
  }
}

export interface ListItem {
  readonly id: ResourceId;
  title: string;
  amount: number;
  capacity?: number;
}
