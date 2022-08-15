import { EcsComponent } from "@/app/ecs";

export class Name extends EcsComponent {
    constructor(readonly name: string) {
        super();
    }
}

export class Unlock extends EcsComponent {
    constructor(public unlocked: boolean) {
        super();
    }
}