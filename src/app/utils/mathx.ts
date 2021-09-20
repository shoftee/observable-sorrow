export function round(num: number, precision = 0): number {
  const scale = Math.pow(10, precision);
  const scaledNumber = num * scale;
  const epsilonCorrected = scaledNumber * (1 + Number.EPSILON);
  return Math.round(epsilonCorrected) / scale;
}

export function percent(num: number, precision = 0): number {
  return round(num * 100, precision);
}
