type ChoiceType<TResult> = {
  frequency?: number;
  result: TResult;
};

type RandomFunc = () => number;

export function choose<TResult>(
  options: ChoiceType<TResult>[],
  total: number,
  randomFunc: RandomFunc = () => Math.random(),
): TResult {
  let providedTotal = 0;
  let unspecifiedCount = 0;
  for (const option of options) {
    if (option.frequency) {
      providedTotal += option.frequency;
    } else {
      unspecifiedCount++;
    }
  }

  if (providedTotal > total) {
    throw new Error(
      "The sum of the specified frequencies must not exceed the specified total.",
    );
  }

  let unspecifiedChance = 0;
  if (unspecifiedCount > 0) {
    unspecifiedChance = (total - providedTotal) / unspecifiedCount;
  }

  // Choose a random value between 0 and total
  const chosen = randomFunc() * total;

  let cutoff = 0;
  for (const option of options) {
    const chance =
      option.frequency !== undefined ? option.frequency : unspecifiedChance;

    if (chosen < cutoff + chance) {
      return option.result;
    }

    cutoff += chance;
  }

  // If the above doesn't return,
  // something must've gone wrong with floating point math,
  // return last item as default
  return options[options.length - 1].result;
}

export interface Chooser {
  choose<TResult>(options: ChoiceType<TResult>[], total: number): TResult;
}

export const DefaultChooser = {
  choose<TResult>(options: ChoiceType<TResult>[], total: number): TResult {
    return choose(options, total, () => Math.random());
  },
};
