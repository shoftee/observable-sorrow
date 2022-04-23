import { ResourceMap } from ".";

export type TransactionSpec = {
  readonly credits?: ResourceMap;
  readonly debits?: ResourceMap;
  onFulfilled: (fulfillment: ResourceMap) => void;
};
