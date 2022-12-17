import { EventSources, getEventSinkPusher } from "@/app/game/systems2/core";
import { label } from "@/app/state";
import { expect } from "chai";

describe("pushEvents", () => {
  it("should create missing sink and add events", () => {
    const events: EventSources = {};
    const pusher = getEventSinkPusher(events);
    pusher.history([
      label("astronomy.rare-event"),
      label("astronomy.observed-sky-reward.capped"),
      label("astronomy.observed-sky-reward.gained", {
        scienceAmount: 250,
      }),
    ]);

    expect(events.history).to.deep.equal([
      { kind: "label", label: "astronomy.rare-event", named: undefined },
      {
        kind: "label",
        label: "astronomy.observed-sky-reward.capped",
        named: undefined,
      },
      {
        kind: "label",
        label: "astronomy.observed-sky-reward.gained",
        named: {
          scienceAmount: 250,
        },
      },
    ]);
  });
  it("should append events to existing sink", () => {
    const events: EventSources = {
      history: [label("astronomy.rare-event")],
    };

    const pusher = getEventSinkPusher(events);
    pusher.history([
      label("astronomy.observed-sky-reward.capped"),
      label("astronomy.observed-sky-reward.gained", {
        scienceAmount: 250,
      }),
    ]);

    expect(events.history).to.deep.equal([
      { kind: "label", label: "astronomy.rare-event", named: undefined },
      {
        kind: "label",
        label: "astronomy.observed-sky-reward.capped",
        named: undefined,
      },
      {
        kind: "label",
        label: "astronomy.observed-sky-reward.gained",
        named: {
          scienceAmount: 250,
        },
      },
    ]);
  });
});
