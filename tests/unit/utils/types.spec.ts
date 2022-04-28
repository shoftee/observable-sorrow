import { getConstructorOf } from "@/app/utils/types";
import { expect } from "chai";

describe("getConstructorOf", () => {
  it("returns constructor of class", () => {
    class A {}
    expect(getConstructorOf(new A())).to.eq(A);
  });
});
