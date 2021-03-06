import { expect } from "chai";
import { random, round, trunc } from "@/app/utils/mathx";

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

describe("random", () => {
  describe("next", () => {
    it("should change internal state", () => {
      const rng1 = random(123456);
      rng1.next();

      const rng2 = random(123456);
      expect(rng1.next()).to.not.equal(rng2.next());
      expect(rng1.state()).to.not.equal(rng2.state());
    });
  });
  describe("parallel next", () => {
    it("should return the same number", () => {
      const rng1 = random(123456);
      const rng2 = random(123456);
      expect(rng1.next()).to.equal(rng2.next());
      expect(rng1.state()).to.equal(rng2.state());
    });
  });
  describe("fork", () => {
    it("should change internal state", () => {
      const rng1 = random(123456);
      rng1.fork();

      const rng2 = random(123456);
      expect(rng1.next()).to.not.equal(rng2.next());
      expect(rng1.state()).to.not.equal(rng2.state());
    });
  });
  describe("parallel fork", () => {
    it("should return the same number", () => {
      const rng1 = random(123456);
      const rng2 = random(123456);
      expect(rng1.fork().next()).to.equal(rng2.fork().next());
    });
  });
  describe("state", () => {
    it("should represent seed value", () => {
      const rng = random(123456);
      rng.next();

      const copy = random(rng.state());
      expect(copy.next()).to.equal(rng.next());
    });
    it("should change on next", () => {
      const rng = random(123456);
      const state1 = rng.state();

      rng.next();
      const state2 = rng.state();
      expect(state1).to.not.equal(state2);

      rng.next();
      const state3 = rng.state();
      expect(state2).to.not.equal(state3);
    });
    it("should be pure", () => {
      const rng = random(123456);
      expect(rng.state()).to.equal(123456);
      expect(rng.state()).to.equal(123456);
    });
  });
});
