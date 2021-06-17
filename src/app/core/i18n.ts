const ResourceStrings = {
  "resources.catnip.title": "catnip",
};

const EnvironmentStrings = {
  "environment.seasons.spring.title": "Spring",
  "environment.seasons.summer.title": "Summer",
  "environment.seasons.autumn.title": "Autumn",
  "environment.seasons.winter.title": "Winter",
};

export const Strings = {
  ...ResourceStrings,
  ...EnvironmentStrings,
};

export type LocalizationKey = keyof typeof Strings;
