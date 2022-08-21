import { MultiMap } from "@/app/utils/collections";
import { EcsEntity } from "../types";

export class HierarchyState {
  // find children by parent
  private readonly childrenLookup = new MultiMap<EcsEntity, EcsEntity>();
  // find parents by children
  private readonly parentsLookup = new Map<EcsEntity, EcsEntity>();

  link(parent: EcsEntity, children: Iterable<EcsEntity>) {
    for (const child of children) {
      this.linkOne(parent, child);
    }
  }

  linkOne(parent: EcsEntity, child: EcsEntity) {
    if (this.parentsLookup.has(child)) {
      throw new Error(`Entity ${child} already has a parent.`);
    }
    this.parentsLookup.set(child, parent);
    this.childrenLookup.add(parent, child);
  }

  unlinkFromParent(child: EcsEntity) {
    const parent = this.parentOf(child);
    if (parent) {
      this.childrenLookup.remove(parent, child, true);
      this.parentsLookup.delete(child);
    }
  }

  unlinkFromChildren(parent: EcsEntity) {
    const children = this.childrenOf(parent);
    for (const child of children) {
      this.parentsLookup.delete(child);
    }
    this.childrenLookup.removeAll(parent);
  }

  parentOf(child: EcsEntity): EcsEntity | undefined {
    return this.parentsLookup.get(child);
  }

  hasParent(child: EcsEntity): boolean {
    return this.parentsLookup.has(child);
  }

  childrenOf(parent: EcsEntity): ReadonlySet<EcsEntity> {
    return this.childrenLookup.entriesForKey(parent);
  }
}
