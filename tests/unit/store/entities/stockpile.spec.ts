import { expect } from "chai";

import { StockpileEntity } from "@/app/game/entity/stockpile";

describe("stockpile persistence", () => {
  it("should save correctly", () => {
    const entity = new StockpileEntity("kitten-growth");
    entity.state.amount = 0.125;

    const store = entity.save();

    expect(store?.amount).to.equal(0.125);
  });
  it("should load correctly", () => {
    const entity = new StockpileEntity("kitten-growth");

    entity.load({ amount: -0.5 });

    expect(entity.state.amount).to.equal(-0.5);
  });
});
