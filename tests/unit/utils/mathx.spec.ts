import { expect } from "chai";
import { percent, round } from "@/app/utils/mathx";

describe("round", () => {
  it("should round 12.0005 away from 0", () => {
    expect(round(12.0005, 3)).to.equal(12.001);
  });
  it("should round -12.0005 away from 0", () => {
    expect(round(-12.0005, 3)).to.equal(-12.001);
  });
  it("should round 12.00049 toward 0", () => {
    expect(round(12.00049, 3)).to.equal(12.0);
  });
  it("should round -12.00049 toward 0", () => {
    expect(round(-12.00049, 3)).to.equal(-12.0);
  });
});

describe("percent", () => {
  it("should round positive to 0 decimals", () => {
    expect(percent(0.125)).to.equal(13);
  });
  it("should round negative to 0 decimals", () => {
    expect(percent(-0.125)).to.equal(-13);
  });
  it("should round positive to 1 decimals", () => {
    expect(percent(0.1255, 1)).to.equal(12.6);
  });
  it("should round negative to 1 decimals", () => {
    expect(percent(-0.1255, 1)).to.equal(-12.6);
  });
  it("should round positive to 2 decimals", () => {
    expect(percent(0.12555, 2)).to.equal(12.56);
  });
  it("should round negative to 2 decimals", () => {
    expect(percent(-0.12555, 2)).to.equal(-12.56);
  });
});
