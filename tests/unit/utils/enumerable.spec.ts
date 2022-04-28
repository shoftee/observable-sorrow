import { Enumerable } from "@/app/utils/enumerable";
import { expect } from "chai";

function* tests() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
}

describe("enumerable", () => {
  describe("toArray", () => {
    it("should turn iterable into array", () => {
      const array = new Enumerable(tests()).toArray();

      expect(array).to.have.ordered.members([1, 2, 3, 4]);
    });
  });
  describe("toMap", () => {
    it("should turn iterable into map", () => {
      const map = new Enumerable(tests()).toMap(
        (i) => "test" + i,
        (i) => i,
      );

      expect(map.get("test1")).to.eq(1);
      expect(map.get("test2")).to.eq(2);
      expect(map.get("test3")).to.eq(3);
      expect(map.get("test4")).to.eq(4);
    });
  });
  describe("filter", () => {
    it("should filter items", () => {
      const array = new Enumerable(tests())
        .filter((x) => x % 2 === 0)
        .toArray();
      expect(array).to.have.ordered.members([2, 4]);
    });
  });
  describe("take", () => {
    it("should return only the first N items", () => {
      const array = new Enumerable(tests()).take(2).toArray();
      expect(array).to.have.ordered.members([1, 2]);
    });
  });
  describe("aggregators", () => {
    it("should return sum", () => {
      const enumerable = new Enumerable(tests());
      const sum = enumerable.reduce(0, (acc, val) => acc + val);
      expect(sum).to.eq(10);
    });
    it("should return product", () => {
      const enumerable = new Enumerable(tests());
      const sum = enumerable.reduce(1, (acc, val) => acc * val);
      expect(sum).to.eq(24);
    });
    it("should concat", () => {
      const enumerable = new Enumerable(tests());
      const str = enumerable.reduce(
        "",
        (acc, val) => (acc !== "" ? acc + ", " : acc) + val.toString(),
      );
      expect(str).to.eq("1, 2, 3, 4");
    });
    it("should return first element", () => {
      const enumerable = new Enumerable(tests());
      const first = enumerable.first();
      expect(first).to.eq(1);
    });
    describe("all", () => {
      it("should return true on empty iterable", () => {
        const enumerable = new Enumerable([]);
        expect(enumerable.all()).to.eq(true);
      });
      it("should return false when predicate returns false once", () => {
        const enumerable = new Enumerable(tests());
        expect(enumerable.all((item) => item < 4)).to.eq(false);
      });
      it("should return true when predicate never returns false", () => {
        const enumerable = new Enumerable(tests());
        expect(enumerable.all((item) => 1 <= item && item <= 4)).to.eq(true);
      });
    });
    describe("any", () => {
      it("should return false on empty iterable", () => {
        const enumerable = new Enumerable([]);
        expect(enumerable.any()).to.eq(false);
      });
      it("should return true if predicate returns true once", () => {
        const enumerable = new Enumerable(tests());
        expect(enumerable.any((item) => item > 3)).to.eq(true);
      });
      it("should return false if predicate never returns true", () => {
        const enumerable = new Enumerable(tests());
        expect(enumerable.any((item) => item > 4)).to.eq(false);
      });
    });
    describe("count", () => {
      it("should return count", () => {
        const enumerable = new Enumerable(tests());
        expect(enumerable.count()).to.eq(4);
      });
    });
  });
  describe("defined", () => {
    it("should filter out undefined", () => {
      function* undefinedTests() {
        yield undefined;
        yield 1;
        yield undefined;
        yield undefined;
        yield 2;
        yield undefined;
        yield undefined;
        yield 3;
        yield undefined;
        yield undefined;
        yield 4;
        yield undefined;
      }

      const enumerable = new Enumerable(undefinedTests());
      const defined = enumerable.defined().toArray();
      expect(defined).to.have.ordered.members([1, 2, 3, 4]);
    });
  });
  describe("filterMap", () => {
    it("should filter out undefined", () => {
      function* filterMapTests() {
        yield 1;
        yield 2;
        yield 3;
        yield 4;
      }
      const enumerable = new Enumerable(filterMapTests());
      const filterMapped = enumerable
        .filterMap((item) => {
          if (item % 2 === 0) return item;
        })
        .toArray();
      expect(filterMapped).to.have.ordered.members([2, 4]);
    });
  });
});
