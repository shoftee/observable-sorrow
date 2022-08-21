import { assert, expect } from "chai";

import { single } from "@/app/utils/collections";

import { EcsComponent, ValueComponent, World } from "@/app/ecs";
import {
  All,
  Read,
  Mut,
  Every,
  None,
  Opt,
  Value,
  ParentQuery,
  ChildrenQuery,
  Eager,
} from "@/app/ecs/query";
import { QueryDescriptor } from "@/app/ecs/query/types";

describe("ecs query", () => {
  class Id extends ValueComponent<string> {
    constructor(readonly value: string) {
      super();
    }
  }

  class Name extends ValueComponent<string> {
    constructor(readonly value: string) {
      super();
    }
  }

  class Player extends EcsComponent {
    constructor(public level: number, public exp: number) {
      super();
    }
  }

  function results<Q extends QueryDescriptor>(world: World, query: Q) {
    return world.queries.get(query).results();
  }

  let world: World;
  beforeEach(() => {
    world = new World();
  });
  describe("value components", () => {
    it("returns multiple entities", () => {
      world.spawn(new Id("shoftee1"));
      world.spawn(new Id("shoftee2"));

      const idQuery = All(Value(Id));
      world.queries.register(idQuery);

      const ids = Array.from(results(world, idQuery));

      expect(ids[0]).to.deep.equal(["shoftee1"]);
      expect(ids[1]).to.deep.equal(["shoftee2"]);
    });
    it("always starts from the first element", () => {
      world.spawn(new Id("shoftee1"));
      world.spawn(new Id("shoftee2"));

      const query = All(Value(Id));
      world.queries.register(query);

      for (const [id] of results(world, query)) {
        expect(id).to.eq("shoftee1");
        break;
      }

      for (const [id] of results(world, query)) {
        expect(id).to.eq("shoftee1");
        break;
      }
    });
  });
  describe("general components", () => {
    it("returns with value and general components", () => {
      world.spawn(new Id("shoftee"), new Player(20, 123));
      world.spawn(new Id("another shoftee"), new Player(20, 123));

      const query = All(Value(Id), Read(Player));
      world.queries.register(query);

      const entries = Array.from(results(world, query));
      expect(entries).to.deep.equal([
        ["shoftee", { level: 20, exp: 123 }],
        ["another shoftee", { level: 20, exp: 123 }],
      ]);
    });
    it("returns only relevant entities", () => {
      world.spawn(new Id("shoftee"), new Player(20, 123));
      world.spawn(new Id("another shoftee"));

      const query = All(Value(Id), Read(Player));
      world.queries.register(query);

      const entries = Array.from(results(world, query));
      expect(entries).to.deep.equal([["shoftee", { level: 20, exp: 123 }]]);
    });
    it("changes query results when components are inserted", () => {
      const entity = world.spawn(new Id("shoftee"));
      world.queries.notifyChanged(entity);

      const query = All(Value(Id), Read(Player));
      world.queries.register(query);

      assert(Array.from(results(world, query)).length === 0);

      world.components.insert(entity, new Player(20, 123));
      world.queries.notifyChanged(entity);

      for (const result of results(world, query)) {
        expect(result).to.deep.equal(["shoftee", { level: 20, exp: 123 }]);
      }
    });
  });
  describe("optional components", () => {
    it("returns entities correctly", () => {
      world.spawn(new Id("35709e7e-2e3e-4541-be9f-76f0a5593bf5"));
      world.spawn(
        new Id("fb73e3d9-7f6f-424e-9af1-0d98e04287d9"),
        new Name("shoftee2"),
      );
      world.spawn(
        new Id("97117bf4-a76d-4e15-b179-f48b6e71a3ac"),
        new Name("shoftee3"),
        new Player(30, 345),
      );
      const query = All(Value(Id), Opt(Value(Name)), Opt(Read(Player)));
      world.queries.register(query);

      const entries = Array.from(results(world, query));
      expect(entries).to.deep.equal([
        ["35709e7e-2e3e-4541-be9f-76f0a5593bf5", undefined, undefined],
        ["fb73e3d9-7f6f-424e-9af1-0d98e04287d9", "shoftee2", undefined],
        [
          "97117bf4-a76d-4e15-b179-f48b6e71a3ac",
          "shoftee3",
          { level: 30, exp: 345 },
        ],
      ]);
    });
  });
  describe("mutable components", () => {
    it("allows mutations", () => {
      world.spawn(new Id("shoftee1"), new Player(20, 123));
      world.spawn(new Id("shoftee2"), new Player(30, 345));

      const query = All(Value(Id), Mut(Player));
      world.queries.register(query);

      for (const [, player] of results(world, query)) {
        player.level += 10;
        player.exp += 10000;
      }

      const entries = Array.from(results(world, query));
      expect(entries).to.deep.equal([
        ["shoftee1", { level: 30, exp: 10123 }],
        ["shoftee2", { level: 40, exp: 10345 }],
      ]);
    });
  });
  describe("filters", () => {
    describe("Every", () => {
      it("excludes entities correctly", () => {
        world.spawn(
          new Id("96a8c161-0100-4ec1-bbb1-049f32dab366"),
          new Name("shoftee"),
          new Player(20, 123),
        );
        world.spawn(new Name("shoftee without an ID"), new Player(30, 345));
        world.spawn(
          new Id("a46f1400-a919-412e-b36c-dba73150adaf"),
          new Player(40, 456),
        );

        const bothQuery = All(Read(Player)).filter(Every(Id, Name));
        world.queries.register(bothQuery);
        const bothEntries = Array.from(results(world, bothQuery));

        expect(bothEntries).to.deep.equal([[{ level: 20, exp: 123 }]]);

        const nameQuery = All(Read(Player)).filter(Every(Name));
        world.queries.register(nameQuery);
        const nameEntries = Array.from(results(world, nameQuery));
        expect(nameEntries).to.deep.equal([
          [{ level: 20, exp: 123 }],
          [{ level: 30, exp: 345 }],
        ]);

        const idQuery = All(Read(Player)).filter(Every(Id));
        world.queries.register(idQuery);
        const idEntries = Array.from(results(world, idQuery));
        expect(idEntries).to.deep.equal([
          [{ level: 20, exp: 123 }],
          [{ level: 40, exp: 456 }],
        ]);
      });
    });
    describe("None", () => {
      it("excludes entities correctly", () => {
        world.spawn(
          new Id("96a8c161-0100-4ec1-bbb1-049f32dab366"),
          new Name("shoftee"),
          new Player(20, 123),
        );
        world.spawn(new Name("shoftee without an ID"), new Player(30, 345));
        world.spawn(
          new Id("a46f1400-a919-412e-b36c-dba73150adaf"),
          new Player(40, 456),
        );

        const withoutName = All(Read(Player)).filter(None(Name));
        world.queries.register(withoutName);
        const withoutNameEntries = single(results(world, withoutName));
        expect(withoutNameEntries).to.deep.equal([{ level: 40, exp: 456 }]);

        const withoutId = All(Read(Player)).filter(None(Id));
        world.queries.register(withoutId);
        const withoutIdEntries = single(results(world, withoutId));
        expect(withoutIdEntries).to.deep.equal([{ level: 30, exp: 345 }]);
      });
    });
  });
  describe("hierarchy", () => {
    class Item extends EcsComponent {
      constructor(readonly itemId: string, public count: number = 0) {
        super();
      }
    }

    describe("ParentQuery", () => {
      it("returns parent", () => {
        world.hierarchy.link(
          world.spawn(new Id("shoftee"), new Player(20, 123)),
          [world.spawn(new Item("potion", 10))],
        );

        const query = All(Read(Item), ParentQuery(Value(Id), Read(Player)));
        world.queries.register(query);

        expect(single(results(world, query))).to.deep.equal([
          { itemId: "potion", count: 10 },
          ["shoftee", { level: 20, exp: 123 }],
        ]);
      });
      it("excludes entities without parents", () => {
        world.spawn(new Item("potion", 10));

        const query = All(Read(Item), ParentQuery(Value(Id), Read(Player)));
        world.queries.register(query);

        expect(results(world, query)).to.be.empty;
      });
    });

    describe("ChildrenQuery", () => {
      it("returns children", () => {
        world.hierarchy.link(
          world.spawn(new Id("shoftee"), new Player(20, 123)),
          [
            world.spawn(new Item("potion", 10)),
            world.spawn(new Item("random junk", 9999)),
          ],
        );

        const query = All(
          Value(Id),
          Read(Player),
          Eager(ChildrenQuery(Read(Item))),
        );
        world.queries.register(query);

        expect(single(results(world, query))).to.deep.equal([
          "shoftee",
          { level: 20, exp: 123 },
          [
            [{ itemId: "potion", count: 10 }],
            [{ itemId: "random junk", count: 9999 }],
          ],
        ]);
      });
      it("returns empty list", () => {
        world.spawn(new Id("shoftee"), new Player(20, 123));

        const query = All(
          Value(Id),
          Read(Player),
          Eager(ChildrenQuery(Read(Item))),
        );
        world.queries.register(query);

        expect(single(results(world, query))).to.deep.equal([
          "shoftee",
          { level: 20, exp: 123 },
          [],
        ]);
      });
    });
  });
});
