import { SectionId } from "@/app/interfaces";

import { ValueComponent } from "@/app/ecs";

export class Section extends ValueComponent<SectionId> {
  constructor(readonly value: SectionId) {
    super();
  }
}

export class Title extends ValueComponent<string> {
  constructor(public value: string) {
    super();
  }
}

export class AlertLabel extends ValueComponent<string | undefined> {
  value: string | undefined;
}
