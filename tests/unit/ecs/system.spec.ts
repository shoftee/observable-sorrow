import { expect } from "chai";

import { EcsComponent, ValueComponent, World } from "@/app/ecs";
import {
  ChangeTrackers,
  ChildrenQuery,
  Commands,
  Eager,
  EntityLookup,
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
      }).build(world);

      Setup();
      world.flush();

      const LevelUpper = System(Query(Mut(Player)))((players) => {
        for (const [player] of players) {
          player.levelUp();
        }
      }).build(world);

      const ChangeTracker = System(Query(ChangeTrackers(Player)))((query) => {
        let changed = 0;
        for (const [trackers] of query) {
          expect(trackers.isChanged()).to.be.true;
          changed++;
        }
        expect(changed).to.eq(3);
      }).build(world);

      LevelUpper();
      ChangeTracker();
    });
  });

  describe("commands", () => {
    it("should spawn entities and insert components", () => {
      const world = new World();

      const Setup = System(Commands())((cmds) => {
        cmds.spawn(new Id("shoftee"), new Player(20));
        cmds.spawn(new Id("shoftee"), new Player(20));
        cmds.spawn(new Id("shoftee"), new Player(20));
      }).build(world);
      Setup();
      world.flush();

      const PlayerChecker = System(Query(Value(Id), Read(Player)))(
        (players) => {
          for (const [id, player] of players) {
            expect(id).to.deep.equal("shoftee");
            expect(player).to.deep.equal({ level: 20 });
          }
        },
      ).build(world);
      PlayerChecker();
    });
    it("should no longer match removed entities", () => {
      const world = new World();

      const Setup = System(Commands())((cmds) => {
        cmds.spawn(new Id("shoftee1"));
        cmds.spawn(new Id("shoftee2"));
        cmds.spawn(new Id("shoftee3"));
      }).build(world);
      Setup();
      world.flush();

      let playerIdMatcher = /^shoftee[123]$/;
      const IdChecker = System(Query(Value(Id)))((players) => {
        for (const [id] of players) {
          expect(id).to.match(playerIdMatcher);
        }
      }).build(world);
      IdChecker();

      const RemovePlayers = System(
        EntityLookup(Value(Id)),
        Commands(),
      )((map, cmds) => {
        cmds.despawn(map.get("shoftee2")!);
      }).build(world);
      RemovePlayers();
      world.flush();

      playerIdMatcher = /^shoftee[13]$/;
      IdChecker();
    });
    it("should spawn entities with children and insert components", () => {
      const world = new World();

      const Setup = System(Commands())((cmds) => {
        cmds.spawn(new Id("mage"), new Player(20)).defer((e) => {
          cmds.spawnChild(e, new ItemStack("Health Potion", 5));
          cmds.spawnChild(e, new ItemStack("Mana Potion", 20));
        });
        cmds.spawn(new Id("brawler"), new Player(10)).defer((e) => {
          cmds.spawnChild(e, new ItemStack("Health Potion", 10));
          cmds.spawnChild(e, new ItemStack("Mana Potion", 15));
        });
      }).build(world);
      Setup();
      world.flush();

      const HierarchyChecker = System(
        Query(Value(Id), Read(Player), Eager(ChildrenQuery(Read(ItemStack)))),
      )((query) => {
        expect(Array.from(query)).to.deep.equal([
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
      }).build(world);
      HierarchyChecker();
    });
    it("should spawn multiple levels of children correctly", () => {
      const world = new World();

      const Setup = System(Commands())((cmds) => {
        cmds.spawn(new Id("name 1")).defer((level1) => {
          cmds.spawnChild(level1, new Id("name 3")).defer((level2) => {
            cmds.spawnChild(level2, new Id("name 7"));
            cmds.spawnChild(level2, new Id("name 8"));
          });
          cmds.spawnChild(level1, new Id("name 4")).defer((level2) => {
            cmds.spawnChild(level2, new Id("name 9"));
            cmds.spawnChild(level2, new Id("name 10"));
          });
        });
        cmds.spawn(new Id("name 2")).defer((level1) => {
          cmds.spawnChild(level1, new Id("name 5")).defer((level2) => {
            cmds.spawnChild(level2, new Id("name 11"));
            cmds.spawnChild(level2, new Id("name 12"));
          });
          cmds.spawnChild(level1, new Id("name 6")).defer((level2) => {
            cmds.spawnChild(level2, new Id("name 13"));
            cmds.spawnChild(level2, new Id("name 14"));
          });
        });
      }).build(world);
      Setup();
      world.flush();

      const HierarchyChecker = System(
        Query(Value(Id), Eager(ChildrenQuery(Value(Id)))),
      )((query) => {
        expect(Array.from(query)).to.deep.equal([
          ["name 1", [["name 3"], ["name 4"]]],
          ["name 2", [["name 5"], ["name 6"]]],
          ["name 3", [["name 7"], ["name 8"]]],
          ["name 4", [["name 9"], ["name 10"]]],
          ["name 5", [["name 11"], ["name 12"]]],
          ["name 6", [["name 13"], ["name 14"]]],
          ["name 7", []],
          ["name 8", []],
          ["name 9", []],
          ["name 10", []],
          ["name 11", []],
          ["name 12", []],
          ["name 13", []],
          ["name 14", []],
        ]);
      }).build(world);
      HierarchyChecker();
    });
  });
});
