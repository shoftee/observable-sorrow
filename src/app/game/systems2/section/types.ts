import { SectionId } from "@/app/interfaces";

import { ReadonlyValueComponent, ValueComponent } from "@/app/ecs";

export class Section extends ReadonlyValueComponent<SectionId> {}

export class Title extends ValueComponent<string> {}

export class AlertLabel extends ValueComponent<string | undefined> {}
