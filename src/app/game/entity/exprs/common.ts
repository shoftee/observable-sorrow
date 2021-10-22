import { EntityAdmin } from "..";

export type Expr<T, Id> = T | ((context: ExprContext<T, Id>) => T);

export type ExprContext<T, Id> = {
  admin: EntityAdmin;
  val: (id: Id) => T;
};

export function effect<T, Id>(id: Id): Expr<T, Id> {
  return (ctx: ExprContext<T, Id>) => ctx.val(id);
}

export function unwrap<T, Id>(expr: Expr<T, Id>, ctx: ExprContext<T, Id>): T {
  return expr instanceof Function ? expr(ctx) : expr;
}
