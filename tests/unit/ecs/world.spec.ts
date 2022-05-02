import { Component, World } from "@/app/ecs";
import { Ref, Mut, ComponentQuery, WorldState, With } from "@/app/ecs/query";
import { assert, expect } from "chai";

describe("ecs world", () => {
  let state: WorldState;
  beforeEach(() => {
    state = new WorldState(new World());
  });
  describe("query all", () => {
    describe("value components", () => {
      it("returns multiple entities", () => {
        const Id = Value();
        state.spawn(new Id("shoftee1"));
        state.spawn(new Id("shoftee2"));

        const idQuery = new ComponentQuery(Ref(Id));
        state.addQuery(idQuery);

        const ids = Array.from(idQuery.all(state.world));

        expect(ids[0][0]).to.deep.equal({ value: "shoftee1" });
        expect(ids[1][0]).to.deep.equal({ value: "shoftee2" });
      });
      it("always starts from the first element", () => {
        const Id = Value();
        state.spawn(new Id("shoftee1"));
        state.spawn(new Id("shoftee2"));

        const query = new ComponentQuery(Ref(Id));
        state.addQuery(query);

        for (const [id] of query.all(state.world)) {
          expect(id.value).to.eq("shoftee1");
          break;
        }

        for (const [id] of query.all(state.world)) {
          expect(id.value).to.eq("shoftee1");
          break;
        }
      });
    });
    describe("general components", () => {
      it("returns with value and general components", () => {
        const Id = Value();
        class Player extends Component {
          constructor(public level: number, public exp: number) {
            super();
          }
        }

        state.spawn(new Id("shoftee"), new Player(20, 123));
        state.spawn(new Id("another shoftee"), new Player(20, 123));

        const query = new ComponentQuery(Ref(Id), Ref(Player));
        state.addQuery(query);

        const entities = Array.from(query.all(state.world));

        expect(entities).to.have.lengthOf(2);
      });
      it("returns only relevant entities", () => {
        const Id = Value();
        class Player extends Component {
          constructor(public level: number, public exp: number) {
            super();
          }
        }

        state.spawn(new Id("shoftee"), new Player(20, 123));
        state.spawn(new Id("another shoftee"));

        const query = new ComponentQuery(Ref(Id), Mut(Player));
        state.addQuery(query);

        for (const [id] of query.all(state.world)) {
          expect(id.value).to.eq("shoftee");
        }
      });
      it("changes query results when components are inserted", () => {
        const Id = Value();
        class Player extends Component {
          constructor(public level: number, public exp: number) {
            super();
          }
        }
        const entity = state.spawn();
        state.insertComponents(entity, new Id("shoftee"));

        const query = new ComponentQuery(Ref(Id), Mut(Player));
        state.addQuery(query);

        assert(Array.from(query.all(state.world)).length === 0);

        state.insertComponents(entity, new Player(20, 123));

        for (const [name, player] of query.all(state.world)) {
          expect(name.value).to.eq("shoftee");
          expect(player.level).to.eq(20);
          expect(player.exp).to.eq(123);
        }
      });
      it("allows mutations", () => {
        const Id = Value();
        class Player extends Component {
          constructor(public level: number, public exp: number) {
            super();
          }
        }
        state.spawn(new Id("shoftee1"), new Player(20, 123));
        state.spawn(new Id("shoftee2"), new Player(30, 345));

        const query = new ComponentQuery(Ref(Id), Mut(Player));
        state.addQuery(query);

        for (const [, player] of query.all(state.world)) {
          player.level += 10;
          player.exp += 10000;
        }

        const entities = Array.from(query.all(state.world));
        expect(entities[0][1].level).to.eq(30);
        expect(entities[0][1].exp).to.eq(10123);
        expect(entities[1][1].level).to.eq(40);
        expect(entities[1][1].exp).to.eq(10345);
      });
    });
    describe("with filters", () => {
      it("excludes filter from query result tuple", () => {
        const Marker = Value();
        class Player extends Component {
          constructor(public level: number, public exp: number) {
            super();
          }
        }

        state.spawn(new Marker("shoftee"), new Player(20, 123));

        const query = new ComponentQuery(With(Marker), Mut(Player));
        state.addQuery(query);

        const [player] = query.single(state.world);
        expect(player.level).to.eq(20);
        expect(player.exp).to.eq(123);
      });
      it("supports multiple with filters", () => {
        const Id = Value();
        const Name = Value();
        class Player extends Component {
          constructor(public level: number, public exp: number) {
            super();
          }
        }

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

        const idAndNameQuery = new ComponentQuery(With(Id, Name), Mut(Player));
        state.addQuery(idAndNameQuery);

        const [playerWithIdAndName] = idAndNameQuery.single(state.world);
        expect(playerWithIdAndName).to.deep.equal({ level: 20, exp: 123 });

        const nameQuery = new ComponentQuery(With(Name), Mut(Player));
        state.addQuery(nameQuery);
        const playersWithName = Array.from(nameQuery.all(state.world));
        expect(playersWithName[0][0]).to.deep.equal({ level: 20, exp: 123 });
        expect(playersWithName[1][0]).to.deep.equal({ level: 30, exp: 345 });

        const idQuery = new ComponentQuery(With(Id), Mut(Player));
        state.addQuery(idQuery);
        const playersWithId = Array.from(idQuery.all(state.world));
        expect(playersWithId[0][0]).to.deep.equal({ level: 20, exp: 123 });
        expect(playersWithId[1][0]).to.deep.equal({ level: 40, exp: 456 });
      });
    });
  });
  describe("query single", () => {
    it("throws error when no results", () => {
      const Id = Value();

      const query = new ComponentQuery(Ref(Id));
      state.addQuery(query);

      expect(() => query.single(state.world)).to.throw("Query has no results");
    });
    it("throws error when more than one result", () => {
      const Id = Value();
      state.spawn(new Id("name1"));
      state.spawn(new Id("name2"));

      const query = new ComponentQuery(Ref(Id));
      state.addQuery(query);

      expect(() => query.single(state.world)).to.throw(
        "Query has more than one result",
      );
    });
  });
});

function Value() {
  return class extends Component {
    constructor(readonly value: string) {
      super();
    }
  };
}
