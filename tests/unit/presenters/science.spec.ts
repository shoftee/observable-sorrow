import { expect } from "chai";
import { unref } from "vue";

import { SciencePresenter, StateManager } from "@/app/presenters";
import { MutationPool, PropertyBag } from "@/app/interfaces";

describe("science presenter", () => {
  let manager: StateManager;
  let presenter: SciencePresenter;
  beforeEach(() => {
    manager = new StateManager();
    presenter = new SciencePresenter(manager);
  });
  it("should have reactive lists", () => {
    const techs = presenter.items;
    expect(techs.value).to.have.lengthOf(0);

    manager.acceptMutations([fulfillmentsAddedPool(), calendarAddedPool()]);
    expect(unref(techs)).to.have.lengthOf(2);

    manager.acceptMutations([]);
  });
  it("should have reactive states", () => {
    const techs = presenter.items;
    expect(techs.value).to.have.lengthOf(0);

    manager.acceptMutations([fulfillmentsAddedPool(), calendarAddedPool()]);
    expect(unref(techs)).to.have.lengthOf(2);

    const calendar = manager.tech("calendar");
    expect(calendar.unlocked).to.be.true;

    const agriculture = manager.tech("agriculture");
    expect(agriculture.unlocked).to.be.false;

    manager.acceptMutations([calendarResearchedPool()]);
    expect(calendar.researched).to.be.true;
    expect(agriculture.unlocked).to.be.true;
  });
});

function fulfillmentsAddedPool(): MutationPool {
  return {
    poolId: "fulfillments",
    added: new Map<string, PropertyBag>([
      [
        "calendar",
        {
          ingredients: [],
          fulfilled: true,
          capped: false,
        },
      ],
      [
        "agriculture",
        {
          ingredients: [],
          fulfilled: true,
          capped: false,
        },
      ],
    ]),
  };
}

function calendarAddedPool(): MutationPool {
  return {
    poolId: "techs",
    added: new Map<string, PropertyBag>([
      [
        "calendar",
        {
          unlocked: true,
          researched: false,
        },
      ],
      [
        "agriculture",
        {
          unlocked: false,
          researched: false,
        },
      ],
    ]),
  };
}

function calendarResearchedPool(): MutationPool {
  return {
    poolId: "techs",
    updated: new Map<string, PropertyBag>([
      ["calendar", { researched: true }],
      ["agriculture", { unlocked: true }],
    ]),
  };
}
