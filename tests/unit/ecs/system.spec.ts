import { expect } from "chai";

import { EcsComponent, ValueComponent, World } from "@/app/ecs";

import {
  ChangeTrackers,
  ChildrenIterable,
  Commands,
  Mut,
  Query,
  Read,
  Value,
} from "@/app/ecs/query";
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

  class ItemStack extends EcsComponent {
    constructor(public name: string, public count: number) {
      super();
    }
  }

  describe("misc", () => {
    it("should mark mutable components as changed when calling member methods", () => {
      const world = new World();

      const Setup = System(Commands())((cmds) => {
        cmds.spawn(new Id("shoftee1"), new Player(20));
        cmds.spawn(new Id("shoftee2"), new Player(20));
        cmds.spawn(new Id("shoftee3"), new Player(20));
      });

      const setupInstance = Setup.build(world);
      setupInstance.run();
      world.flush();

      const LevelUpper = System(Query(Mut(Player)))((players) => {
        for (const [player] of players.all()) {
          player.levelUp();
        }
      });
      const levelUpperInstance = LevelUpper.build(world);

      const ChangeTracker = System(Query(ChangeTrackers(Player)))((query) => {
        let changed = 0;
        for (const [trackers] of query.all()) {
          expect(trackers.isChanged()).to.be.true;
          changed++;
        }
        expect(changed).to.eq(3);
      });
      const changeTrackerInstance = ChangeTracker.build(world);

      levelUpperInstance.run();
      changeTrackerInstance.run();
    });
  });

  describe("commands", () => {
    it("should spawn entities and insert components", () => {
      const world = new World();

      const Setup = System(Commands())((cmds) => {
        cmds.spawn(new Id("shoftee"), new Player(20));
        cmds.spawn(new Id("shoftee"), new Player(20));
        cmds.spawn(new Id("shoftee"), new Player(20));
      });
      const setupInstance = Setup.build(world);
      setupInstance.run();
      world.flush();

      const PlayerChecker = System(Query(Value(Id), Read(Player)))(
        (players) => {
          for (const [id, player] of players.all()) {
            expect(id).to.deep.equal("shoftee");
            expect(player).to.deep.equal({ level: 20 });
          }
        },
      );
      const playerCheckerInstance = PlayerChecker.build(world);
      playerCheckerInstance.run();
    });
    it("should spawn entities with children and insert components", () => {
      const world = new World();

      const Setup = System(Commands())((cmds) => {
        cmds.spawn(new Id("mage"), new Player(20)).asParent((parent) => {
          cmds.spawnChild(parent, new ItemStack("Health Potion", 5));
          cmds.spawnChild(parent, new ItemStack("Mana Potion", 20));
        });
        cmds.spawn(new Id("brawler"), new Player(10)).asParent((parent) => {
          cmds.spawnChild(parent, new ItemStack("Health Potion", 10));
          cmds.spawnChild(parent, new ItemStack("Mana Potion", 15));
        });
      });
      const setupInstance = Setup.build(world);
      setupInstance.run();
      world.flush();

      const HierarchyChecker = System(
        Query(Value(Id), Read(Player), ChildrenIterable(Read(ItemStack))),
      )((query) => {
        const results = Array.from(query.all(), ([id, player, children]) => {
          return [id, player, Array.from(children)];
        });
        expect(results).to.deep.equal([
          [
            "mage",
            { level: 20 },
            [
              [{ name: "Health Potion", count: 5 }],
              [{ name: "Mana Potion", count: 20 }],
            ],
          ],
          [
            "brawler",
            { level: 10 },
            [
              [{ name: "Health Potion", count: 10 }],
              [{ name: "Mana Potion", count: 15 }],
            ],
          ],
        ]);
      });
      const hierarchyCheckerInstance = HierarchyChecker.build(world);
      hierarchyCheckerInstance.run();
    });
  });
});
