import { IMutationSink } from "./mutation";

class BaseManager {
  readonly mutationSink: IMutationSink;

  constructor(mutationSink: IMutationSink) {
    this.mutationSink = mutationSink;
  }
}

export { BaseManager };
