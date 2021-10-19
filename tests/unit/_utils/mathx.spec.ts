import { expect } from "chai";
import { round } from "@/app/utils/mathx";

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
