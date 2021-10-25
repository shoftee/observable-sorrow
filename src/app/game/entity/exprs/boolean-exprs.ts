import { BooleanEffectId } from "@/app/interfaces";

import { Expr } from "./common";

export type BooleanExpr = Expr<boolean, BooleanEffectId>;

export const BooleanExprs: Record<BooleanEffectId, BooleanExpr> = {
  "unlock.section.society": ({ admin }) => admin.society().state.totalPops > 0,
  "unlock.section.science": ({ admin }) =>
    admin.building("library").state.level > 0,
  "unlock.job.scholar": ({ admin }) =>
    admin.building("library").state.level > 0,
  "unlock.job.farmer": ({ admin }) =>
    admin.tech("agriculture").state.researched,
};
