import { assert, expect } from "chai";

import { single } from "@/app/utils/collections";

import { EcsComponent, ValueComponent, World, WorldState } from "@/app/ecs";
import { All, Read, Mut, With, Without, Opt, Value } from "@/app/ecs/query";

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

  let state: WorldState;
  beforeEach(() => {
    state = new WorldState(new World());
  });
  describe("value components", () => {
    it("returns multiple entities", () => {
      state.spawn(new Id("shoftee1"));
      state.spawn(new Id("shoftee2"));

      const idQuery = All(Value(Id));
      state.addQuery(idQuery);

      const ids = Array.from(state.fetchQuery(idQuery));

      expect(ids[0]).to.deep.equal(["shoftee1"]);
      expect(ids[1]).to.deep.equal(["shoftee2"]);
    });
    it("always starts from the first element", () => {
      state.spawn(new Id("shoftee1"));
      state.spawn(new Id("shoftee2"));

      const query = All(Value(Id));
      state.addQuery(query);

      for (const [id] of state.fetchQuery(query)) {
        expect(id).to.eq("shoftee1");
        break;
      }

      for (const [id] of state.fetchQuery(query)) {
        expect(id).to.eq("shoftee1");
        break;
      }
    });
  });
  describe("general components", () => {
    it("returns with value and general components", () => {
      state.spawn(new Id("shoftee"), new Player(20, 123));
      state.spawn(new Id("another shoftee"), new Player(20, 123));

      const query = All(Value(Id), Read(Player));
      state.addQuery(query);

      const results = Array.from(state.fetchQuery(query));
      expect(results).to.deep.equal([
        ["shoftee", { level: 20, exp: 123 }],
        ["another shoftee", { level: 20, exp: 123 }],
      ]);
    });
    it("returns only relevant entities", () => {
      state.spawn(new Id("shoftee"), new Player(20, 123));
      state.spawn(new Id("another shoftee"));

      const query = All(Value(Id), Read(Player));
      state.addQuery(query);

      const results = Array.from(state.fetchQuery(query));
      expect(results).to.deep.equal([["shoftee", { level: 20, exp: 123 }]]);
    });
    it("changes query results when components are inserted", () => {
      const entity = state.spawn();
      state.insertComponents(entity, new Id("shoftee"));

      const query = All(Value(Id), Read(Player));
      state.addQuery(query);

      assert(Array.from(state.fetchQuery(query)).length === 0);

      state.insertComponents(entity, new Player(20, 123));

      for (const result of state.fetchQuery(query)) {
        expect(result).to.deep.equal(["shoftee", { level: 20, exp: 123 }]);
      }
    });
  });
  describe("optional components", () => {
    it("returns entities correctly", () => {
      state.spawn(new Id("35709e7e-2e3e-4541-be9f-76f0a5593bf5"));
      state.spawn(
        new Id("fb73e3d9-7f6f-424e-9af1-0d98e04287d9"),
        new Name("shoftee2"),
      );
      state.spawn(
        new Id("97117bf4-a76d-4e15-b179-f48b6e71a3ac"),
        new Name("shoftee3"),
        new Player(30, 345),
      );
      const query = All(Value(Id), Opt(Value(Name)), Opt(Read(Player)));
      state.addQuery(query);

      const results = Array.from(state.fetchQuery(query));
      expect(results).to.deep.equal([
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
      state.spawn(new Id("shoftee1"), new Player(20, 123));
      state.spawn(new Id("shoftee2"), new Player(30, 345));

      const query = All(Value(Id), Mut(Player));
      state.addQuery(query);

      for (const [, player] of state.fetchQuery(query)) {
        player.level += 10;
        player.exp += 10000;
      }

      const results = Array.from(state.fetchQuery(query));
      expect(results).to.deep.equal([
        ["shoftee1", { level: 30, exp: 10123 }],
        ["shoftee2", { level: 40, exp: 10345 }],
      ]);
    });
  });
  describe("with filters", () => {
    it("excludes entities correctly", () => {
      state.spawn(
        new Id("96a8c161-0100-4ec1-bbb1-049f32dab366"),
        new Name("shoftee"),
        new Player(20, 123),
      );
      state.spawn(new Name("shoftee without an ID"), new Player(30, 345));
      state.spawn(
        new Id("a46f1400-a919-412e-b36c-dba73150adaf"),
        new Player(40, 456),
      );

      const bothQuery = All(Read(Player)).filter(With(Id, Name));
      state.addQuery(bothQuery);
      const bothResults = Array.from(state.fetchQuery(bothQuery));

      expect(bothResults).to.deep.equal([[{ level: 20, exp: 123 }]]);

      const nameQuery = All(Read(Player)).filter(With(Name));
      state.addQuery(nameQuery);
      const nameResults = Array.from(state.fetchQuery(nameQuery));
      expect(nameResults).to.deep.equal([
        [{ level: 20, exp: 123 }],
        [{ level: 30, exp: 345 }],
      ]);

      const idQuery = All(Read(Player)).filter(With(Id));
      state.addQuery(idQuery);
      const idResults = Array.from(state.fetchQuery(idQuery));
      expect(idResults).to.deep.equal([
        [{ level: 20, exp: 123 }],
        [{ level: 40, exp: 456 }],
      ]);
    });
  });
  describe("without filters", () => {
    it("excludes entities correctly", () => {
      state.spawn(
        new Id("96a8c161-0100-4ec1-bbb1-049f32dab366"),
        new Name("shoftee"),
        new Player(20, 123),
      );
      state.spawn(new Name("shoftee without an ID"), new Player(30, 345));
      state.spawn(
        new Id("a46f1400-a919-412e-b36c-dba73150adaf"),
        new Player(40, 456),
      );

      const withoutName = All(Read(Player)).filter(Without(Name));
      state.addQuery(withoutName);
      const withoutNameResults = single(state.fetchQuery(withoutName));
      expect(withoutNameResults).to.deep.equal([{ level: 40, exp: 456 }]);

      const withoutId = All(Read(Player)).filter(Without(Id));
      state.addQuery(withoutId);
      const withoutIdResults = single(state.fetchQuery(withoutId));
      expect(withoutIdResults).to.deep.equal([{ level: 30, exp: 345 }]);
    });
  });
});
