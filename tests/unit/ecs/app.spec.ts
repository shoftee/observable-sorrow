import { expect } from "chai";

import { MultiMap } from "@/app/utils/collections";

import { App, EcsComponent, EcsEvent, EcsStage } from "@/app/ecs";
import { System } from "@/app/ecs/system";
import {
  Dispatch,
  Receive,
  Query,
  Mut,
  Read,
  Changed,
  Commands,
  Added,
  ChangeTrackers,
} from "@/app/ecs/query";
import { MinimalPlugins } from "@/app/ecs/plugins";

describe("ecs app", () => {
  describe("events", () => {
    class StringEvent extends EcsEvent {
      constructor(readonly stringValue: string) {
        super();
      }
    }

    class NumberEvent extends EcsEvent {
      constructor(readonly numberValue: number) {
        super();
      }
    }

    it("should access multiple event types", () => {
      let dispatcherUpdates = 0;
      const Dispatcher = System(
        Dispatch(StringEvent),
        Dispatch(NumberEvent),
      )((strings, numbers) => {
        strings.dispatch(new StringEvent("sent"));
        numbers.dispatch(new NumberEvent(20));

        dispatcherUpdates++;
      });

      let receiverUpdates = 0;
      const Receiver = System(
        Receive(StringEvent),
        Receive(NumberEvent),
      )((strings, numbers) => {
        const ev1s = Array.from(strings.pull());
        expect(ev1s).lengthOf(1);
        expect(ev1s[0].stringValue).to.eq("sent");

        const ev2s = Array.from(numbers.pull());
        expect(ev2s).lengthOf(1);
        expect(ev2s[0].numberValue).to.eq(20);

        receiverUpdates++;
      });

      const runner = new App()
        .registerEvent(StringEvent)
        .registerEvent(NumberEvent)
        .addSystem(Dispatcher)
        .addSystem(Receiver, { after: [Dispatcher] })
        .buildRunner();

      const updater = runner.start();
      updater();

      expect(dispatcherUpdates).to.eq(1);
      expect(receiverUpdates).to.eq(1);
    });
    it("should access events over multiple updates", () => {
      let dispatcherUpdates = 0;
      const Dispatcher = System(Dispatch(NumberEvent))((numbers) => {
        numbers.dispatch(new NumberEvent(1234));
        dispatcherUpdates++;
      });

      let receiverUpdates = 0;
      const Receiver = System(Receive(NumberEvent))((numbers) => {
        const evs = Array.from(numbers.pull());
        expect(evs).lengthOf(1);
        expect(evs[0].numberValue).to.eq(1234);

        receiverUpdates++;
      });

      const runner = new App()
        .registerEvent(NumberEvent)
        .addSystem(Dispatcher)
        .addSystem(Receiver)
        .buildRunner();

      const updater = runner.start();
      updater();
      updater();
      updater();

      expect(dispatcherUpdates).to.eq(3);
      expect(receiverUpdates).to.eq(3);
    });
  });
  describe("system run order", () => {
    it("should run systems in the right order", () => {
      let counter = 0;
      const counters = new MultiMap<EcsStage, number>();
      function builder(stage: EcsStage) {
        return System()(() => {
          counters.add(stage, counter++);
        });
      }

      const runner = new App()
        .addSystem(builder("first-start"), { stage: "first-start" })
        .addSystem(builder("first"), { stage: "first" })
        .addSystem(builder("first-end"), { stage: "first-end" })
        .addSystem(builder("startup-start"), { stage: "startup-start" })
        .addSystem(builder("startup"), { stage: "startup" })
        .addSystem(builder("startup-end"), { stage: "startup-end" })
        .addSystem(builder("main-start"), { stage: "main-start" })
        .addSystem(builder("main"), { stage: "main" })
        .addSystem(builder("main-end"), { stage: "main-end" })
        .addSystem(builder("last-start"), { stage: "last-start" })
        .addSystem(builder("last"), { stage: "last" })
        .addSystem(builder("last-end"), { stage: "last-end" })
        .buildRunner();

      const updater = runner.start();
      updater();
      updater();
      updater();

      const getCounts = (s: EcsStage) => Array.from(counters.entriesForKey(s));

      expect(getCounts("startup-start")).to.have.ordered.members([0]);
      expect(getCounts("startup")).to.have.ordered.members([1]);
      expect(getCounts("startup-end")).to.have.ordered.members([2]);

      expect(getCounts("first-start")).to.have.ordered.members([3, 12, 21]);
      expect(getCounts("first")).to.have.ordered.members([4, 13, 22]);
      expect(getCounts("first-end")).to.have.ordered.members([5, 14, 23]);

      expect(getCounts("main-start")).to.have.ordered.members([6, 15, 24]);
      expect(getCounts("main")).to.have.ordered.members([7, 16, 25]);
      expect(getCounts("main-end")).to.have.ordered.members([8, 17, 26]);

      expect(getCounts("last-start")).to.have.ordered.members([9, 18, 27]);
      expect(getCounts("last")).to.have.ordered.members([10, 19, 28]);
      expect(getCounts("last-end")).to.have.ordered.members([11, 20, 29]);
    });
  });
  describe("change detection", () => {
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

    it("should filter changed components correctly", () => {
      let levelUps = 0;
      const LevelUpSystem = System(Query(Mut(Player)))((players) => {
        for (const [player] of players) {
          player.level++;
        }
        levelUps++;
      });

      let detected = 0;
      const ChangedCounter = System(
        Query(Read(Player)).filter(Changed(Player)),
      )((players) => {
        for (const [{ level }] of players) {
          expect(level).to.eq(20 + levelUps);
          detected++;
        }
      });

      const SpawnSystem = System(Commands())((cmds) => {
        cmds.spawn(new Id("shoftee"), new Player(20));
        cmds.spawn(new Id("shoftee"), new Player(20));
        cmds.spawn(new Id("shoftee"), new Player(20));
      });

      const runner = new App()
        .addPlugin(new MinimalPlugins())
        .addStartupSystem(SpawnSystem)
        .addSystem(LevelUpSystem)
        .addSystem(ChangedCounter, { stage: "last" })
        .buildRunner();

      const updater = runner.start();

      updater();
      expect(levelUps).to.eq(1);
      expect(detected).to.eq(3);

      updater();
      expect(levelUps).to.eq(2);
      expect(detected).to.eq(6);

      updater();
      expect(levelUps).to.eq(3);
      expect(detected).to.eq(9);
    });
    it("should filter added components correctly", () => {
      let added = 0;
      const SpawnSystem = System(Commands())((cmds) => {
        if (added < 3) {
          cmds.spawn(new Id("shoftee"), new Player(20));
          added++;
        }
      });

      let detected = 0;
      const AddedCounter = System(Query(Read(Player)).filter(Added(Player)))(
        (players) => {
          for (const [{ level }] of players) {
            expect(level).to.eq(20);
            detected++;
          }
        },
      );

      const runner = new App()
        .addPlugin(new MinimalPlugins())
        .addSystem(SpawnSystem)
        .addSystem(AddedCounter, { stage: "last" })
        .buildRunner();

      const updater = runner.start();

      updater();
      expect(detected).to.eq(added).and.eq(1);

      updater();
      expect(detected).to.eq(added).and.eq(2);

      updater();
      expect(detected).to.eq(added).and.eq(3);

      // we stop adding after 3
      updater();
      expect(detected).to.eq(added).and.eq(3);
    });
    it("should track changes correctly", () => {
      let added = 0;
      const SpawnSystem = System(Commands())((cmds) => {
        if (added < 2) {
          cmds.spawn(new Id("shoftee"), new Player(20));
          added++;
        }
      });

      const LevelUpper = System(Query(Mut(Player)).filter(Added(Player)))(
        (players) => {
          for (const [player] of players) {
            player.level++;
          }
        },
      );

      let detectedAdditions = 0;
      const AddedCounter = System(Query(ChangeTrackers(Player)))((query) => {
        for (const [trackers] of query) {
          if (trackers.isAdded()) {
            detectedAdditions++;
          }
        }
      });

      let detectedChanges = 0;
      const ChangedCounter = System(Query(ChangeTrackers(Player)))((query) => {
        for (const [trackers] of query) {
          if (trackers.isChanged()) {
            detectedChanges++;
          }
        }
      });

      const runner = new App()
        .addPlugin(new MinimalPlugins())
        .addSystem(SpawnSystem, { stage: "first" })
        .addSystem(LevelUpper)
        .addSystem(AddedCounter, { stage: "last" })
        .addSystem(ChangedCounter, { stage: "last" })
        .buildRunner();

      const updater = runner.start();

      updater();
      expect(detectedAdditions).to.eq(detectedChanges).and.eq(1);

      updater();
      expect(detectedAdditions).to.eq(detectedChanges).and.eq(2);

      // we stop adding after 2
      // level ups only happen for added entities, so changes also stop at 2
      updater();
      expect(detectedAdditions).to.eq(detectedChanges).and.eq(2);
    });
  });
});
