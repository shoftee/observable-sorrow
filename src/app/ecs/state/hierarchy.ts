import { getOrAddWeak } from "@/app/utils/collections";

import { EcsEntity } from "../types";

type Node = {
  readonly entity: EcsEntity;
  parent: Node | undefined;
  children: Set<Node>;
};

export class HierarchyState {
  private readonly nodes = new WeakMap<EcsEntity, Node>();

  link(parent: EcsEntity, children: Iterable<EcsEntity>) {
    const parentNode = this.node(parent);
    for (const child of children) {
      const childNode = this.node(child);
      this.linkNodes(parentNode, childNode);
    }
  }

  linkOne(parent: EcsEntity, child: EcsEntity) {
    this.linkNodes(this.node(parent), this.node(child));
  }

  private linkNodes(parent: Node, child: Node) {
    if (child.parent !== undefined) {
      throw new Error(
        `Entity ${child.entity} already has a parent entity ${child.parent.entity}`,
      );
    }

    child.parent = parent;
    parent.children.add(child);
  }

  unlinkFromParent(child: EcsEntity) {
    const node = this.node(child);
    if (node.parent === undefined) {
      throw new Error(
        `Entity ${node.entity} does not have a parent to unlink.`,
      );
    }

    node.parent.children.delete(node);
    node.parent = undefined;
  }

  unlinkFromChildren(parent: EcsEntity) {
    const node = this.node(parent);
    for (const childNode of node.children) {
      childNode.parent = undefined;
    }
    node.children.clear();
  }

  *parentsOf(entity: EcsEntity): Iterable<EcsEntity> {
    let current = this.node(entity);
    while (current.parent) {
      yield current.parent.entity;
      current = current.parent;
    }
  }

  parentOf(entity: EcsEntity): EcsEntity | undefined {
    return this.node(entity).parent?.entity;
  }

  hasParent(entity: EcsEntity): boolean {
    return this.node(entity).parent !== undefined;
  }

  *childrenOf(entity: EcsEntity): Iterable<EcsEntity> {
    const children = this.node(entity).children;
    for (const child of children) {
      yield child.entity;
    }
  }

  private node(entity: EcsEntity): Node {
    return getOrAddWeak(this.nodes, entity, (entity) => ({
      entity,
      parent: undefined,
      children: new Set<Node>(),
    }));
  }
}
