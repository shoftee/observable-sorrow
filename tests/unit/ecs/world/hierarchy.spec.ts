import { expect } from "chai";

import { EcsComponent, World } from "@/app/ecs";

describe("ecs world hierarchy", () => {
  class Id extends EcsComponent {
    constructor(readonly id: string) {
      super();
    }
  }

  class Item extends EcsComponent {
    constructor(readonly id: string, public count: number) {
      super();
    }
  }

  class BodyPart extends EcsComponent {
    constructor(readonly id: string) {
      super();
    }
  }

  let world: World;
  beforeEach(() => {
    world = new World();
  });
  describe("link(parent, ...children)", () => {
    it("should set children and parent", () => {
      let player, item1, item2;
      world.hierarchy.link((player = world.spawn(new Id("shoftee"))), [
        (item1 = world.spawn(new Item("potion", 10))),
        (item2 = world.spawn(new Item("junk", 9999))),
      ]);

      const children = world.hierarchy.childrenOf(player);
      expect(Array.from(children)).to.deep.equal([item1, item2]);

      expect(world.hierarchy.parentOf(item1)).to.deep.equal(player);
      expect(world.hierarchy.parentOf(item2)).to.deep.equal(player);

      const parents1 = world.hierarchy.parentsOf(item1);
      expect(Array.from(parents1)).to.deep.equal([player]);

      const parents2 = world.hierarchy.parentsOf(item1);
      expect(Array.from(parents2)).to.deep.equal([player]);
    });
  });
  describe("linkOne(parent, child)", () => {
    it("should set children and parent", () => {
      let player, item;
      world.hierarchy.linkOne(
        (player = world.spawn(new Id("shoftee"))),
        (item = world.spawn(new Item("potion", 10))),
      );

      const children = world.hierarchy.childrenOf(player);
      expect(Array.from(children)).to.deep.equal([item]);

      const parent = world.hierarchy.parentOf(item);
      expect(parent).to.deep.equal(player);

      const parents = world.hierarchy.parentsOf(item);
      expect(Array.from(parents)).to.deep.equal([player]);
    });
  });
  describe("parentsOf()", () => {
    it("should list parents in traversal order", () => {
      const player = world.spawn(new Id("shoftee"));
      const leftHand = world.spawn(new BodyPart("left-hand"));
      const rightHand = world.spawn(new BodyPart("right-hand"));
      world.hierarchy.link(player, [leftHand, rightHand]);

      const ring1 = world.spawn(new Item("ring of power", 1));
      world.hierarchy.linkOne(leftHand, ring1);

      const ring2 = world.spawn(new Item("ring of magic", 2));
      world.hierarchy.linkOne(rightHand, ring2);

      const parents1 = world.hierarchy.parentsOf(ring1);
      expect(Array.from(parents1)).to.deep.equal([leftHand, player]);

      const parents2 = world.hierarchy.parentsOf(ring2);
      expect(Array.from(parents2)).to.deep.equal([rightHand, player]);
    });
  });
});
