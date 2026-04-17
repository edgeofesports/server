import { Router } from "express";
import { createOrder_C, createPaymentOption_C, getOrderInfo_C, getPaymentInfo_C, razorpayPaymentHandler_C } from "./payment.controller.js";
import { createOrder_V, createPaymenOption_V, razorpayPaymentHandler_V } from "./payment.validator.js";

const paymentRouter = Router()

paymentRouter.post("/create/order", createOrder_V, createOrder_C)
paymentRouter.post("/create/paymentoption/:orderId", createPaymenOption_V, createPaymentOption_C)
paymentRouter.post("/razorpay/handler", razorpayPaymentHandler_V, razorpayPaymentHandler_C)
paymentRouter.get("/order/status/:orderId", getOrderInfo_C)
paymentRouter.get("/pay/status/:paymentId", getPaymentInfo_C)

export default paymentRouter;