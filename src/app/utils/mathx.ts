export function round(num: number, precision = 0): number {
  return rounded(num, precision, Math.round);
}

export function trunc(num: number, precision = 0): number {
  return rounded(num, precision, Math.trunc);
}

function rounded(
  num: number,
  precision: number,
  fn: (n: number) => number,
): number {
  const scale = Math.pow(10, precision);
  const scaledNumber = num * scale;
  const epsilonCorrected = scaledNumber * (1 + Number.EPSILON);
  return fn(epsilonCorrected) / scale;
}

export interface Prng {
  state(): number;
  next(): number;
  fork(): Prng;
}

export function random(seed: number): Prng {
  let state = seed;

  // https://stackoverflow.com/a/47593316/586472
  function mulberry32() {
    let t = (state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    state: () => state,
    next: () => mulberry32(),
    fork: () => random(mulberry32()),
  };
}
