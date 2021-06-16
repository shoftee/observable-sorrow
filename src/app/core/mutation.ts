interface IMutation {
  apply(): void;
  undo(): void;
}

interface IMutationSink {
  send(m: IMutation): void;
}

export { IMutation, IMutationSink };
