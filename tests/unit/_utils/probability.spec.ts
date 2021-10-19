import { expect } from "chai";
import { choose } from "@/app/utils/probability";

describe("probability", () => {
  describe("choose", () => {
    describe("with only unspecified frequencies", () => {
      it("should select results correctly", () => {
        const options = [{ result: "one" }, { result: "two" }];

        expect(choose(options, 1, () => 0.0)).to.equal("one");
        expect(choose(options, 1, () => 0.25)).to.equal("one");
        expect(choose(options, 1, () => 0.49)).to.equal("one");

        expect(choose(options, 1, () => 0.5)).to.equal("two");
        expect(choose(options, 1, () => 0.75)).to.equal("two");
        expect(choose(options, 1, () => 0.99)).to.equal("two");

        expect(choose(options, 1, () => 1)).to.equal("two");
      });
    });
    describe("with one unspecified frequency", () => {
      it("should select results correctly (first)", () => {
        const options = [
          { result: "one" },
          { result: "two", frequency: 1 },
          { result: "three", frequency: 1 },
        ];

        expect(choose(options, 4, () => 0.0)).to.equal("one");
        expect(choose(options, 4, () => 0.24)).to.equal("one");
        expect(choose(options, 4, () => 0.49)).to.equal("one");

        expect(choose(options, 4, () => 0.5)).to.equal("two");
        expect(choose(options, 4, () => 0.74)).to.equal("two");

        expect(choose(options, 4, () => 0.75)).to.equal("three");
        expect(choose(options, 4, () => 0.99)).to.equal("three");

        expect(choose(options, 4, () => 1)).to.equal("three");
      });
      it("should select results correctly (middle)", () => {
        const options = [
          { result: "one", frequency: 1 },
          { result: "two" },
          { result: "three", frequency: 1 },
        ];

        expect(choose(options, 4, () => 0.0)).to.equal("one");
        expect(choose(options, 4, () => 0.24)).to.equal("one");

        expect(choose(options, 4, () => 0.25)).to.equal("two");
        expect(choose(options, 4, () => 0.5)).to.equal("two");
        expect(choose(options, 4, () => 0.74)).to.equal("two");

        expect(choose(options, 4, () => 0.75)).to.equal("three");
        expect(choose(options, 4, () => 0.99)).to.equal("three");

        expect(choose(options, 4, () => 1)).to.equal("three");
      });
      it("should select results correctly (last)", () => {
        const options = [
          { result: "one", frequency: 1 },
          { result: "two", frequency: 1 },
          { result: "three" },
        ];

        expect(choose(options, 4, () => 0.0)).to.equal("one");
        expect(choose(options, 4, () => 0.24)).to.equal("one");

        expect(choose(options, 4, () => 0.25)).to.equal("two");
        expect(choose(options, 4, () => 0.49)).to.equal("two");

        expect(choose(options, 4, () => 0.5)).to.equal("three");
        expect(choose(options, 4, () => 0.75)).to.equal("three");
        expect(choose(options, 4, () => 0.99)).to.equal("three");

        expect(choose(options, 4, () => 1)).to.equal("three");
      });
    });
    describe("with two unspecified frequencies", () => {
      it("should select results correctly (first two)", () => {
        const options = [
          { result: "one" },
          { result: "two" },
          { result: "three", frequency: 1 },
        ];

        expect(choose(options, 2, () => 0.0)).to.equal("one");
        expect(choose(options, 2, () => 0.24)).to.equal("one");

        expect(choose(options, 2, () => 0.25)).to.equal("two");
        expect(choose(options, 2, () => 0.49)).to.equal("two");

        expect(choose(options, 2, () => 0.5)).to.equal("three");
        expect(choose(options, 2, () => 0.75)).to.equal("three");
        expect(choose(options, 2, () => 0.99)).to.equal("three");

        expect(choose(options, 2, () => 1)).to.equal("three");
      });
      it("should select results correctly (last two)", () => {
        const options = [
          { result: "one", frequency: 1 },
          { result: "two" },
          { result: "three" },
        ];

        expect(choose(options, 2, () => 0.0)).to.equal("one");
        expect(choose(options, 2, () => 0.49)).to.equal("one");

        expect(choose(options, 2, () => 0.5)).to.equal("two");
        expect(choose(options, 2, () => 0.74)).to.equal("two");

        expect(choose(options, 2, () => 0.75)).to.equal("three");
        expect(choose(options, 2, () => 0.99)).to.equal("three");

        expect(choose(options, 2, () => 1)).to.equal("three");
      });
      it("should select results correctly (first and last)", () => {
        const options = [
          { result: "one" },
          { result: "two", frequency: 1 },
          { result: "three" },
        ];

        expect(choose(options, 2, () => 0.0)).to.equal("one");
        expect(choose(options, 2, () => 0.24)).to.equal("one");

        expect(choose(options, 2, () => 0.25)).to.equal("two");
        expect(choose(options, 2, () => 0.5)).to.equal("two");
        expect(choose(options, 2, () => 0.74)).to.equal("two");

        expect(choose(options, 2, () => 0.75)).to.equal("three");
        expect(choose(options, 2, () => 0.99)).to.equal("three");

        expect(choose(options, 4, () => 1)).to.equal("three");
      });
    });
  });
});
