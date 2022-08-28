import { expect } from "chai";
import { choose } from "@/app/utils/probability";

describe("probability", () => {
  describe("choose", () => {
    describe("with only unspecified frequencies", () => {
      it("should select results correctly", () => {
        const spec = {
          options: [{ result: "one" }, { result: "two" }],
          total: 1,
        };

        expect(choose(spec, () => 0.0)).to.equal("one");
        expect(choose(spec, () => 0.25)).to.equal("one");
        expect(choose(spec, () => 0.49)).to.equal("one");

        expect(choose(spec, () => 0.5)).to.equal("two");
        expect(choose(spec, () => 0.75)).to.equal("two");
        expect(choose(spec, () => 0.99)).to.equal("two");

        expect(choose(spec, () => 1)).to.equal("two");
      });
    });
    describe("with one unspecified frequency", () => {
      it("should select results correctly (first)", () => {
        const spec = {
          options: [
            { result: "one" },
            { result: "two", frequency: 1 },
            { result: "three", frequency: 1 },
          ],
          total: 4,
        };

        expect(choose(spec, () => 0.0)).to.equal("one");
        expect(choose(spec, () => 0.24)).to.equal("one");
        expect(choose(spec, () => 0.49)).to.equal("one");

        expect(choose(spec, () => 0.5)).to.equal("two");
        expect(choose(spec, () => 0.74)).to.equal("two");

        expect(choose(spec, () => 0.75)).to.equal("three");
        expect(choose(spec, () => 0.99)).to.equal("three");

        expect(choose(spec, () => 1)).to.equal("three");
      });
      it("should select results correctly (middle)", () => {
        const spec = {
          options: [
            { result: "one", frequency: 1 },
            { result: "two" },
            { result: "three", frequency: 1 },
          ],
          total: 4,
        };

        expect(choose(spec, () => 0.0)).to.equal("one");
        expect(choose(spec, () => 0.24)).to.equal("one");

        expect(choose(spec, () => 0.25)).to.equal("two");
        expect(choose(spec, () => 0.5)).to.equal("two");
        expect(choose(spec, () => 0.74)).to.equal("two");

        expect(choose(spec, () => 0.75)).to.equal("three");
        expect(choose(spec, () => 0.99)).to.equal("three");

        expect(choose(spec, () => 1)).to.equal("three");
      });
      it("should select results correctly (last)", () => {
        const spec = {
          options: [
            { result: "one", frequency: 1 },
            { result: "two", frequency: 1 },
            { result: "three" },
          ],
          total: 4,
        };

        expect(choose(spec, () => 0.0)).to.equal("one");
        expect(choose(spec, () => 0.24)).to.equal("one");

        expect(choose(spec, () => 0.25)).to.equal("two");
        expect(choose(spec, () => 0.49)).to.equal("two");

        expect(choose(spec, () => 0.5)).to.equal("three");
        expect(choose(spec, () => 0.75)).to.equal("three");
        expect(choose(spec, () => 0.99)).to.equal("three");

        expect(choose(spec, () => 1)).to.equal("three");
      });
    });
    describe("with two unspecified frequencies", () => {
      it("should select results correctly (first two)", () => {
        const spec = {
          options: [
            { result: "one" },
            { result: "two" },
            { result: "three", frequency: 1 },
          ],
          total: 2,
        };
        expect(choose(spec, () => 0.0)).to.equal("one");
        expect(choose(spec, () => 0.24)).to.equal("one");

        expect(choose(spec, () => 0.25)).to.equal("two");
        expect(choose(spec, () => 0.49)).to.equal("two");

        expect(choose(spec, () => 0.5)).to.equal("three");
        expect(choose(spec, () => 0.75)).to.equal("three");
        expect(choose(spec, () => 0.99)).to.equal("three");

        expect(choose(spec, () => 1)).to.equal("three");
      });
      it("should select results correctly (last two)", () => {
        const spec = {
          options: [
            { result: "one", frequency: 1 },
            { result: "two" },
            { result: "three" },
          ],
          total: 2,
        };
        expect(choose(spec, () => 0.0)).to.equal("one");
        expect(choose(spec, () => 0.49)).to.equal("one");

        expect(choose(spec, () => 0.5)).to.equal("two");
        expect(choose(spec, () => 0.74)).to.equal("two");

        expect(choose(spec, () => 0.75)).to.equal("three");
        expect(choose(spec, () => 0.99)).to.equal("three");

        expect(choose(spec, () => 1)).to.equal("three");
      });
      it("should select results correctly (first and last)", () => {
        const spec = {
          options: [
            { result: "one" },
            { result: "two", frequency: 1 },
            { result: "three" },
          ],
          total: 2,
        };
        expect(choose(spec, () => 0.0)).to.equal("one");
        expect(choose(spec, () => 0.24)).to.equal("one");

        expect(choose(spec, () => 0.25)).to.equal("two");
        expect(choose(spec, () => 0.5)).to.equal("two");
        expect(choose(spec, () => 0.74)).to.equal("two");

        expect(choose(spec, () => 0.75)).to.equal("three");
        expect(choose(spec, () => 0.99)).to.equal("three");

        expect(choose(spec, () => 1)).to.equal("three");
      });
    });
  });
});
