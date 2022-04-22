import { BooleanEffectId } from "@/app/interfaces";

import { effect, Expr } from "./common";

export type BooleanExpr = Expr<boolean, BooleanEffectId>;

export const BooleanExprs: Record<BooleanEffectId, BooleanExpr> = {
  // sections
  // society
  "unlock.section.society": ({ admin }) =>
    admin.resource("kittens").state.unlocked,
  "unlock.section.management": effect("unlock.section.happiness"),
  "unlock.section.happiness": ({ admin }) => admin.pops().size >= 5,

  // science
  "unlock.section.science": ({ admin }) =>
    admin.building("library").state.level > 0,

  // jobs
  "unlock.job.scholar": ({ admin }) =>
    admin.building("library").state.level > 0,
  "unlock.job.farmer": ({ admin }) =>
    admin.tech("agriculture").state.researched,
  "unlock.job.hunter": ({ admin }) => admin.tech("archery").state.researched,
  "unlock.job.miner": ({ admin }) => admin.building("mine").state.level > 0,

  // buildings
  "unlock.building.barn": ({ admin }) =>
    admin.tech("agriculture").state.researched,
  "unlock.building.mine": ({ admin }) => admin.tech("mining").state.researched,
};
