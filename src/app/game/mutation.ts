interface IMutation {
  apply(): void;
}

interface IMutationQueue {
  queue(mutation: IMutation): void;
}

export { IMutation, IMutationQueue };
