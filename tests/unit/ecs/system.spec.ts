import { expect } from "chai";

import { Component, World, WorldState } from "@/app/ecs";
import { Query, System } from "@/app/ecs/system";
import { Read } from "@/app/ecs/query";

describe("ecs", () => {
  describe("systems", () => {
    it("should compile", () => {
      const PlayerSystem = System(Query(Read(Id), Read(Player)))((players) => {
        for (const test of players.all()) {
          expect(test[0]).to.deep.equal({ value: "shoftee" });
          expect(test[1]).to.deep.equal({ level: 20 });
        }
      });

      const state = new WorldState(new World());
      state.spawn(new Id("shoftee"), new Player(20));
      state.spawn(new Id("shoftee"), new Player(20));
      state.spawn(new Id("shoftee"), new Player(20)); 

      const system = new PlayerSystem(state);
      system.update();
    });
  });
});

class Id extends Component {
  constructor(readonly value: string) {
    super();
  }
}

class Player extends Component {
  constructor(public level: number) {
    super();
  }
}
