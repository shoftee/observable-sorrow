import { expect } from "chai";
import { SandcastleBuilderNotation } from "@/app/utils/notation/sandcastle-builder";

const n = new SandcastleBuilderNotation();

describe("sandcastle builder notation", () => {
  describe("number", () => {
    it("should ignore precision when number is integer", () => {
      expect(n.number(1234, 2, "negative")).to.equal("1234");
      expect(n.number(1234, 3, "negative")).to.equal("1234");
      expect(n.number(1234, 2, "always")).to.equal("+1234");
      expect(n.number(1234, 3, "always")).to.equal("+1234");
      expect(n.number(-1234, 2, "always")).to.equal("-1234");
      expect(n.number(-1234, 3, "always")).to.equal("-1234");
    });
    it("should format decimals correctly", () => {
      expect(n.number(1234.567, 2, "negative")).to.equal("1234.57");
      expect(n.number(1234.5678, 3, "negative")).to.equal("1234.568");
    });
    it("should format sign correctly", () => {
      expect(n.number(1234.567, 3, "always")).to.equal("+1234.567");
      expect(n.number(-1234.567, 3, "always")).to.equal("-1234.567");
      expect(n.number(0, 3, "always")).to.equal("0");
    });
    it("should format numbers less than 9e3", () => {
      expect(n.number(1234.56789, 3, "negative")).to.equal("1234.568");
      expect(n.number(8999.999, 3, "negative")).to.equal("8999.999");
    });
    describe("between 9e3 and 1e6", () => {
      it("should round up number at limit", function () {
        expect(n.number(8999.999, 2, "negative")).to.equal("9K");
      });
      it("should format round numbers correctly", () => {
        expect(n.number(9000, 3, "negative")).to.equal("9K");
        expect(n.number(10000, 3, "negative")).to.equal("10K");
        expect(n.number(100000, 3, "negative")).to.equal("100K");
      });
      it("should format almost-round numbers correctly", () => {
        expect(n.number(9001, 2, "negative")).to.equal("9K");
        expect(n.number(10001, 2, "negative")).to.equal("10K");
        expect(n.number(99999, 2, "negative")).to.equal("100K");
        expect(n.number(100001, 2, "negative")).to.equal("100K");
      });
      it("should format precise numbers correctly", () => {
        expect(n.number(9001, 3, "negative")).to.equal("9.001K");
        expect(n.number(10001, 3, "negative")).to.equal("10.001K");
        expect(n.number(99999, 3, "negative")).to.equal("99.999K");
        expect(n.number(100001, 3, "negative")).to.equal("100.001K");
        expect(n.number(999999, 3, "negative")).to.equal("999.999K");
      });
    });
    it("should format Number.MAX_VALUE correctly", () => {
      expect(n.number(Number.MAX_VALUE, 2, "negative")).to.equal("179.77TWWQ");
      expect(n.number(Number.MAX_VALUE, 3, "negative")).to.equal("179.769TWWQ");
    });
    it("should format Infinity correctly", () => {
      expect(n.number(Number.POSITIVE_INFINITY, 3, "negative")).to.equal(
        "Infinity",
      );
      expect(n.number(Number.POSITIVE_INFINITY, 3, "always")).to.equal(
        "+Infinity",
      );
      expect(n.number(Number.NEGATIVE_INFINITY, 3, "always")).to.equal(
        "-Infinity",
      );
    });
  });
  describe("percent", () => {
    describe("sign formatting", () => {
      it("should format positive numbers correctly", () => {
        expect(n.percent(0.12, 0, "negative")).to.equal("12%");
        expect(n.percent(0.12, 0, "always")).to.equal("+12%");
      });
      it("should format negative numbers correctly", () => {
        expect(n.percent(-0.12, 0, "negative")).to.equal("-12%");
        expect(n.percent(-0.12, 0, "always")).to.equal("-12%");
      });
    });
    describe("rounding", () => {
      it("should round positive numbers correctly", () => {
        expect(n.percent(0.123, 0, "negative")).to.equal("12%");
        expect(n.percent(0.127, 0, "negative")).to.equal("13%");
      });
      it("should round negative numbers correctly", () => {
        expect(n.percent(-0.123, 0, "negative")).to.equal("-12%");
        expect(n.percent(-0.127, 0, "negative")).to.equal("-13%");
      });
    });
  });
});
