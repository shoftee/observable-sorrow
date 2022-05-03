import { App, Event, SystemStage } from "@/app/ecs";
import { Receive, System, Dispatch } from "@/app/ecs/system";
import { MultiMap } from "@/app/utils/collections";

import { expect } from "chai";

describe("ecs app", () => {
  describe("events", () => {
    class StringEvent extends Event {
      constructor(readonly stringValue: string) {
        super();
      }
    }

    class NumberEvent extends Event {
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
        .addSystem(Dispatcher, "preUpdate")
        .addSystem(Receiver, "update")
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
        .addSystem(Dispatcher, "preUpdate")
        .addSystem(Receiver, "update")
        .buildRunner();

      const updater = runner.start();
      updater();
      updater();
      updater();

      expect(dispatcherUpdates).to.eq(3);
      expect(receiverUpdates).to.eq(3);
    });
  });
  describe("systems", () => {
    it("should run systems in the right order", () => {
      let counter = 0;
      const counters = new MultiMap<SystemStage, number>();
      function builder(stage: SystemStage) {
        return System()(() => {
          counters.add(stage, counter++);
        });
      }

      const runner = new App()
        .addSystem(builder("first"), "first")
        .addSystem(builder("startup"), "startup")
        .addSystem(builder("preUpdate"), "preUpdate")
        .addSystem(builder("update"), "update")
        .addSystem(builder("postUpdate"), "postUpdate")
        .addSystem(builder("last"), "last")
        .buildRunner();

      const updater = runner.start();
      updater();
      updater();
      updater();

      const first = Array.from(counters.entriesForKey("first"));
      expect(first).to.have.ordered.members([0, 6, 11]);

      const startup = Array.from(counters.entriesForKey("startup"));
      expect(startup).to.have.ordered.members([1]);

      const preUpdate = Array.from(counters.entriesForKey("preUpdate"));
      expect(preUpdate).to.have.ordered.members([2, 7, 12]);

      const update = Array.from(counters.entriesForKey("update"));
      expect(update).to.have.ordered.members([3, 8, 13]);

      const postUpdate = Array.from(counters.entriesForKey("postUpdate"));
      expect(postUpdate).to.have.ordered.members([4, 9, 14]);

      const last = Array.from(counters.entriesForKey("last"));
      expect(last).to.have.ordered.members([5, 10, 15]);
    });
  });
});
