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

    manager.acceptMutations([calendarAddedPool()]);
    expect(unref(techs)).to.have.lengthOf(2);

    manager.acceptMutations([]);
  });
  it("should have reactive states", () => {
    const techs = presenter.items;
    expect(techs.value).to.have.lengthOf(0);

    manager.acceptMutations([calendarAddedPool()]);

    const calendar = manager.tech("calendar");
    expect(calendar.fulfilled).to.be.false;
    expect(calendar.ingredients[0].fulfillment).to.equal(0);

    manager.acceptMutations([calendarFulfilledPool()]);
    expect(calendar.fulfilled).to.be.true;
    expect(calendar.ingredients[0].fulfilled).to.be.true;
    expect(calendar.ingredients[0].fulfillment).to.equal(42);

    const agriculture = manager.tech("agriculture");
    manager.acceptMutations([calendarResearchedPool()]);
    expect(unref(techs)).to.have.lengthOf(2);
    expect(agriculture.fulfilled).to.be.true;
    expect(agriculture.ingredients[0].fulfillment).to.equal(200);
  });
});

function calendarAddedPool(): MutationPool {
  return {
    poolId: "techs",
    added: new Map<string, PropertyBag>([
      [
        "calendar",
        {
          unlocked: true,
          capped: false,
          researched: false,
          fulfilled: false,
          ingredients: [
            {
              resourceId: "science",
              fulfillment: 0,
              requirement: 30,
              capped: false,
              fulfilled: false,
            },
          ],
        },
      ],
      [
        "agriculture",
        {
          unlocked: false,
          capped: false,
          researched: false,
          fulfilled: false,
          ingredients: [
            {
              resourceId: "science",
              fulfillment: 0,
              requirement: 100,
              capped: false,
              fulfilled: false,
            },
          ],
        },
      ],
    ]),
  };
}

function calendarFulfilledPool(): MutationPool {
  return {
    poolId: "techs",
    updated: new Map<string, PropertyBag>([
      [
        "calendar",
        {
          fulfilled: true,
          ingredients: [
            {
              resourceId: "science",
              fulfillment: 42,
              fulfilled: true,
            },
          ],
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
      [
        "agriculture",
        {
          unlocked: true,
          fulfilled: true,
          ingredients: [
            { resourceId: "science", fulfillment: 200, fulfilled: true },
          ],
        },
      ],
    ]),
  };
}
