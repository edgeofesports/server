import { Router } from "express";
import { createTransaction_C, createWithdrawalRequest_C, crTransactionByAdmin_C } from "./transactions.controller.js";
import { createTransaction_V } from "./transactions.validator.js";

const transactionRouter = Router();

transactionRouter.post("/create", createTransaction_V, createTransaction_C)
transactionRouter.post("/create/cr/byadmin", crTransactionByAdmin_C)
transactionRouter.post("/request/withdrawal", createWithdrawalRequest_C)

export { transactionRouter };