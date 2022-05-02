import { expect } from "chai";

import { Component, World } from "@/app/ecs";
import { Query, System } from "@/app/ecs/system";
import { Ref, WorldState } from "@/app/ecs/query";

describe("ecs", () => {
  describe("systems", () => {
    it("should compile", () => {
      const Id = Value();
      class Player extends Component {
        constructor(public level: number) {
          super();
        }
      }
      const PlayerSystem = System(Query(Ref(Id), Ref(Player)))((players) => {
        for (const [id, player] of players.all()) {
          expect(id.value).to.eq("shoftee");
          expect(player.level).to.eq(20);
        }
      });

      const world = new World();
      world.spawn(new Id("shoftee"), new Player(20));
      world.spawn(new Id("shoftee"), new Player(20));
      world.spawn(new Id("shoftee"), new Player(20));
      const state = new WorldState(world);

      const system = new PlayerSystem(state);
      system.update();
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
