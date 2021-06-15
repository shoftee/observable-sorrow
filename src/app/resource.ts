export type Id = "catnip";

export class Resource {
    readonly id: Id = "catnip";
    amount = 0;
    capacity? = 10;
    change?: number;
}