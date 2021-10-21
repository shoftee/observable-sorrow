import { NumberEffectId } from "@/app/interfaces";
import { EntityAdmin } from "..";

export type Expr<T> = T | ((context: ExprContext<T>) => T);

export type ExprContext<T> = {
  admin: EntityAdmin;
  val: (id: NumberEffectId) => T;
};

export function effect<T>(id: NumberEffectId): Expr<T> {
  return (ctx: ExprContext<T>) => ctx.val(id);
}

export function unwrap<T>(expr: Expr<T>, ctx: ExprContext<T>): T {
  return expr instanceof Function ? expr(ctx) : expr;
}
