import { expect } from "chai";
import { SandcastleBuilderFormatter as fmt } from "@/app/presenters/common/formatter";

describe("sandcastle builder notation", () => {
  describe("number", () => {
    it("should ignore precision when number is integer", () => {
      expect(fmt(1234, 2, "negative")).to.equal("1234");
      expect(fmt(1234, 3, "negative")).to.equal("1234");
      expect(fmt(1234, 2, "always")).to.equal("+1234");
      expect(fmt(1234, 3, "always")).to.equal("+1234");
      expect(fmt(-1234, 2, "always")).to.equal("-1234");
      expect(fmt(-1234, 3, "always")).to.equal("-1234");
    });
    it("should format decimals correctly", () => {
      expect(fmt(1234.567, 2, "negative")).to.equal("1234.57");
      expect(fmt(1234.5678, 3, "negative")).to.equal("1234.568");
    });
    it("should format sign correctly", () => {
      expect(fmt(1234.567, 3, "always")).to.equal("+1234.567");
      expect(fmt(-1234.567, 3, "always")).to.equal("-1234.567");
      expect(fmt(0, 3, "always")).to.equal("+0");
    });
    it("should format numbers less than 9e3", () => {
      expect(fmt(1234.56789, 3, "negative")).to.equal("1234.568");
      expect(fmt(8999.999, 3, "negative")).to.equal("8999.999");
    });
    describe("between 9e3 and 1e6", () => {
      it("should round up number at limit", function () {
        expect(fmt(8999.999, 2, "negative")).to.equal("9K");
      });
      it("should format round numbers correctly", () => {
        expect(fmt(9000, 3, "negative")).to.equal("9K");
        expect(fmt(10000, 3, "negative")).to.equal("10K");
        expect(fmt(100000, 3, "negative")).to.equal("100K");
      });
      it("should format almost-round numbers correctly", () => {
        expect(fmt(9001, 2, "negative")).to.equal("9K");
        expect(fmt(10001, 2, "negative")).to.equal("10K");
        expect(fmt(99999, 2, "negative")).to.equal("100K");
        expect(fmt(100001, 2, "negative")).to.equal("100K");
      });
      it("should format precise numbers correctly", () => {
        expect(fmt(9001, 3, "negative")).to.equal("9.001K");
        expect(fmt(10001, 3, "negative")).to.equal("10.001K");
        expect(fmt(99999, 3, "negative")).to.equal("99.999K");
        expect(fmt(100001, 3, "negative")).to.equal("100.001K");
        expect(fmt(999999, 3, "negative")).to.equal("999.999K");
      });
    });
    it("should format Number.MAX_VALUE correctly", () => {
      expect(fmt(Number.MAX_VALUE, 2, "negative")).to.equal("179.77TWWQ");
      expect(fmt(Number.MAX_VALUE, 3, "negative")).to.equal("179.769TWWQ");
    });
    it("should format Infinity correctly", () => {
      expect(fmt(Number.POSITIVE_INFINITY, 3, "negative")).to.equal("Infinity");
      expect(fmt(Number.NEGATIVE_INFINITY, 3, "negative")).to.equal(
        "-Infinity",
      );
      expect(fmt(Number.POSITIVE_INFINITY, 3, "always")).to.equal("+Infinity");
      expect(fmt(Number.NEGATIVE_INFINITY, 3, "always")).to.equal("-Infinity");
    });
  });
});
