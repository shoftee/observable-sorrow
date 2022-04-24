import { ResourceMap } from ".";

export type RewardSpec = {
  readonly credits?: ResourceMap;
  readonly debits?: ResourceMap;
  onFulfilled: (fulfillment: ResourceMap) => void;
};
