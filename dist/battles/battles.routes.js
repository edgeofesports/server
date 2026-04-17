import { Router } from "express";
import { getSingleBattle_V, joinBattle_V } from "./battles.validator.js";
import { createBattleOrder, getAllBattles, getCompletedBattles_C, getLiveBattles_C, getRegisteredBattle_C, getSingleBattle_C, getUpcomingBattles_C } from "./battles.controller.js";
const battleRouter = Router();
battleRouter.get("/get/all", getAllBattles);
battleRouter.get("/get/registeredbattle", getRegisteredBattle_C);
battleRouter.get("/get/upcoming", getUpcomingBattles_C);
battleRouter.get("/get/live", getLiveBattles_C);
battleRouter.get("/get/completed", getCompletedBattles_C);
battleRouter.post("/join", joinBattle_V, createBattleOrder);
battleRouter.get("/get/:_id", getSingleBattle_V, getSingleBattle_C);
export default battleRouter;
//# sourceMappingURL=battles.routes.js.map