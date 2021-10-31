import { BooleanEffectId } from "@/app/interfaces";

import { Expr } from "./common";

export type BooleanExpr = Expr<boolean, BooleanEffectId>;

export const BooleanExprs: Record<BooleanEffectId, BooleanExpr> = {
  "unlock.section.society": ({ admin }) =>
    admin.resource("kittens").state.unlocked,
  "unlock.section.science": ({ admin }) =>
    admin.building("library").state.level > 0,
  "unlock.job.scholar": ({ admin }) =>
    admin.building("library").state.level > 0,
  "unlock.job.farmer": ({ admin }) =>
    admin.tech("agriculture").state.researched,
  "unlock.job.miner": ({ admin }) => admin.building("mine").state.level > 0,
  "unlock.building.barn": ({ admin }) =>
    admin.tech("agriculture").state.researched,
  "unlock.building.mine": ({ admin }) => admin.tech("mining").state.researched,
};
