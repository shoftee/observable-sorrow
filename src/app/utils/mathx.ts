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
