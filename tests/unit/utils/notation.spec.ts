import { expect } from "chai";
import { SandcastleBuilderNotation } from "@/app/utils/notation/sandcastle-builder";

const n = new SandcastleBuilderNotation();

describe("sandcastle builder notation", () => {
  it("should ignore precision when number is integer", () => {
    expect(n.display(1234, 2, false)).to.equal("1234");
    expect(n.display(1234, 3, false)).to.equal("1234");
    expect(n.display(1234, 2, true)).to.equal("+1234");
    expect(n.display(1234, 3, true)).to.equal("+1234");
    expect(n.display(-1234, 2, true)).to.equal("-1234");
    expect(n.display(-1234, 3, true)).to.equal("-1234");
  });
  it("should format decimals correctly", () => {
    expect(n.display(1234.567, 2, false)).to.equal("1234.57");
    expect(n.display(1234.5678, 3, false)).to.equal("1234.568");
  });
  it("should format sign correctly", () => {
    expect(n.display(1234.567, 3, true)).to.equal("+1234.567");
    expect(n.display(-1234.567, 3, true)).to.equal("-1234.567");
    expect(n.display(0, 3, true)).to.equal("0");
  });
  it("should format numbers less than 9e3", () => {
    expect(n.display(1234.56789, 3, false)).to.equal("1234.568");
    expect(n.display(8999.999, 3, false)).to.equal("8999.999");
  });
  describe("between 9e3 and 1e6", () => {
    it("should round up number at limit", function () {
      expect(n.display(8999.999, 2, false)).to.equal("9K");
    });
    it("should format round numbers correctly", () => {
      expect(n.display(9000, 3, false)).to.equal("9K");
      expect(n.display(10000, 3, false)).to.equal("10K");
      expect(n.display(100000, 3, false)).to.equal("100K");
    });
    it("should format almost-round numbers correctly", () => {
      expect(n.display(9001, 2, false)).to.equal("9K");
      expect(n.display(10001, 2, false)).to.equal("10K");
      expect(n.display(99999, 2, false)).to.equal("100K");
      expect(n.display(100001, 2, false)).to.equal("100K");
    });
    it("should format precise numbers correctly", () => {
      expect(n.display(9001, 3, false)).to.equal("9.001K");
      expect(n.display(10001, 3, false)).to.equal("10.001K");
      expect(n.display(99999, 3, false)).to.equal("99.999K");
      expect(n.display(100001, 3, false)).to.equal("100.001K");
      expect(n.display(999999, 3, false)).to.equal("999.999K");
    });
  });
  it("should format Number.MAX_VALUE correctly", () => {
    expect(n.display(Number.MAX_VALUE, 2, false)).to.equal("179.77TWWQ");
    expect(n.display(Number.MAX_VALUE, 3, false)).to.equal("179.769TWWQ");
  });
  it("should format Infinity correctly", () => {
    expect(n.display(Number.POSITIVE_INFINITY, 3, false)).to.equal("Infinity");
    expect(n.display(Number.POSITIVE_INFINITY, 3, true)).to.equal("+Infinity");
    expect(n.display(Number.NEGATIVE_INFINITY, 3, true)).to.equal("-Infinity");
  });
});
