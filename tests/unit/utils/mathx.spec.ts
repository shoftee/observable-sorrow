import { expect } from "chai";
import { round, trunc } from "@/app/utils/mathx";

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

describe("trunc", () => {
  it("should truncate 12.0005 to 12", () => {
    expect(trunc(12.0005)).to.equal(12);
  });
  it("should truncate 12.9995 to 12", () => {
    expect(trunc(12.9995)).to.equal(12);
  });
  it("should truncate -12.0005 to -12", () => {
    expect(trunc(-12.0005)).to.equal(-12);
  });
  it("should truncate -12.9995 to -12", () => {
    expect(trunc(-12.9995)).to.equal(-12);
  });
  describe("with precision 3", () => {
    it("should truncate 12.0005 to 12", () => {
      expect(trunc(12.0005, 3)).to.equal(12);
    });
    it("should truncate -12.0005 to -12", () => {
      expect(trunc(-12.0005, 3)).to.equal(-12);
    });
    it("should truncate 12.9995 to 12.999", () => {
      expect(trunc(12.9995, 3)).to.equal(12.999);
    });
    it("should truncate -12.9995 to -12.999", () => {
      expect(trunc(-12.9995, 3)).to.equal(-12.999);
    });
  });
});
