import { IBonfireInteractor } from "../bonfire";

export interface IInteractorSystem {
  readonly bonfire: IBonfireInteractor;
}

export class InteractorSystem implements IInteractorSystem {
  constructor(readonly bonfire: IBonfireInteractor) {}
}
