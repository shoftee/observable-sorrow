import { expect } from "chai";

import { EcsComponent, ValueComponent, World, WorldState } from "@/app/ecs";

import { ChangeTrackers, Commands, Mut, Query, Read } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

describe("ecs systems", () => {
  class Id extends ValueComponent<string> {
    constructor(readonly value: string) {
      super();
    }
  }

  class Player extends EcsComponent {
    constructor(public level: number) {
      super();
    }

    levelUp() {
      this.level++;
    }
  }

  it("should compile", () => {
    const Setup = System(Commands())((cmds) => {
      cmds.spawn(new Id("shoftee"), new Player(20));
      cmds.spawn(new Id("shoftee"), new Player(20));
      cmds.spawn(new Id("shoftee"), new Player(20));
    });

    const PlayerChecker = System(Query(Read(Id), Read(Player)))((players) => {
      for (const [id, player] of players.all()) {
        expect(id).to.deep.equal({ value: "shoftee" });
        expect(player).to.deep.equal({ level: 20 });
      }
    });

    const state = new WorldState(new World());
    const setupInstance = Setup.build(state);
    const playerCheckerInstance = PlayerChecker.build(state);

    setupInstance.run();
    state.flush();

    playerCheckerInstance.run();
  });

  it("should mark mutable components as changed when calling member methods", () => {
    const Setup = System(Commands())((cmds) => {
      cmds.spawn(new Id("shoftee1"), new Player(20));
      cmds.spawn(new Id("shoftee2"), new Player(20));
      cmds.spawn(new Id("shoftee3"), new Player(20));
    });

    const LevelUpper = System(Query(Mut(Player)))((players) => {
      for (const [player] of players.all()) {
        player.levelUp();
      }
    });

    const ChangeTracker = System(Query(ChangeTrackers(Player)))((query) => {
      let changed = 0;
      for (const [trackers] of query.all()) {
        expect(trackers.isChanged()).to.be.true;
        changed++;
      }
      expect(changed).to.eq(3);
    });

    const state = new WorldState(new World());

    const setupInstance = Setup.build(state);
    const levelUpperInstance = LevelUpper.build(state);
    const changeTrackerInstance = ChangeTracker.build(state);

    setupInstance.run();
    state.flush();

    levelUpperInstance.run();
    changeTrackerInstance.run();
  });
});
