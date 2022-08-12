import { expect } from "chai";

import { EcsComponent, World, WorldState } from "@/app/ecs";

import { Query, Read } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

describe("ecs systems", () => {
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

    const system = PlayerSystem.build(state);
    system.run();
  });
});

class Id extends EcsComponent {
  constructor(readonly value: string) {
    super();
  }
}

class Player extends EcsComponent {
  constructor(public level: number) {
    super();
  }
}
