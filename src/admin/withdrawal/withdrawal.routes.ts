import { Router } from "express";
import { acceptWithdrawal, getAllWithdrawalRequest } from "./withdrawal.controller.js";

const withdrawalRouter = Router();

withdrawalRouter.get("/get/allRequest", getAllWithdrawalRequest)
withdrawalRouter.get("/acceptwithdrawal", acceptWithdrawal)

export default withdrawalRouter;