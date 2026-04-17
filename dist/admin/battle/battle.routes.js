import { Router } from "express";
import { createBattleController, distributePrizes_C, getRegisteredBattle, hostBattle_C, publishPositions_C } from "./battle.controller.js";
import { hostBattle_V } from "./battle.validator.js";
const battleRouter = Router();
battleRouter.post("/create", createBattleController);
battleRouter.post("/host/:battle", hostBattle_V, hostBattle_C);
battleRouter.get("/getregisteredbattle", getRegisteredBattle);
battleRouter.post("/publish/positions", publishPositions_C);
battleRouter.post("/distribute-prizes", distributePrizes_C);
export default battleRouter;
//# sourceMappingURL=battle.routes.js.map