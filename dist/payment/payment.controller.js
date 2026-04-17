import mongoose from "mongoose";
import Razorpay from "razorpay";
import { razorpayOrders, razorpayPayments } from "./payment.model.js";
import { userModel } from "../users/user.model.js";
var razorpay = new Razorpay({
    key_id: "rzp_live_vltjM3WQNYwXDN",
    key_secret: "tC7eoi54LSFNojKPTq0XIDZ6",
});
export const createOrder_C = async (req, res) => {
    const { amount, user } = req.body;
    if (!user.id) {
        return res.status(404).json({
            success: false,
            error: "unAuhtorized",
        });
    }
    try {
        const totalOrders = await (await razorpayOrders.aggregate([{ $count: "length" }]))[0].length;
        const options = {
            amount: +amount * 100,
            currency: "INR",
            receipt: `order_receipt_${totalOrders + 1}`,
            payment_capture: 1,
        };
        const response = await razorpay.orders.create(options);
        const data = await razorpayOrders.create({
            orderId: response.id,
            response,
            createdBy: user.id,
        });
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message ? error.message : error,
        });
    }
};
export const createPaymentOption_C = async (req, res) => {
    const { orderId } = req.body.order;
    const { user } = req.body;
    try {
        const options = {
            key: "rzp_live_vltjM3WQNYwXDN",
            currency: "INR",
            name: "edge of eSports",
            description: "Battle in $tyle",
            order_id: orderId,
            prefill: {
                name: user.name,
                email: "demo@gmail.com",
                contact: "999999999",
            },
            theme: {
                color: "#F37254",
            },
        };
        res.status(200).json({
            success: true,
            data: options,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message ? error.message : error,
        });
    }
};
export const razorpayPaymentHandler_C = async (req, res) => {
    const { user, response, status } = req.body;
    try {
        await razorpayPayments.create({
            createdBy: user.id,
            response,
            status,
        });
        if (status === "failed") {
            return res.status(400).json({
                success: false,
                error: "payment failed",
            });
        }
        const order = await razorpayOrders.findOne({
            orderId: response.razorpay_order_id,
            createdBy: new mongoose.Types.ObjectId(user.id),
        });
        const duser = await userModel.findOne({
            _id: new mongoose.Types.ObjectId(user.id),
        });
        if (order && duser) {
            const data = await fetch("http://127.0.0.1:5000/transaction/create", {
                method: "POST",
                headers: {
                    apikey: "123@edgeofwaresports.com",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: "credited",
                    type: "top-up",
                    value: +order.response.amount / 100,
                    razorpayOrderId: response.razorpay_order_id,
                }),
            });
            const jsonResponse = await data.json();
            if (jsonResponse.success) {
                return res.status(200).json({
                    success: true,
                    data: jsonResponse.data,
                });
            }
            if (!jsonResponse.success) {
                return res.status(400).json({
                    success: false,
                    error: jsonResponse.error,
                });
            }
        }
        if (!order) {
            return res.status(400).json({
                success: false,
                error: "order not found",
            });
        }
        if (!duser) {
            return res.status(400).json({
                success: false,
                error: "user not found",
            });
        }
        res.status(404).json({
            success: false,
            error: "something went wrong",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message ? error.message : error,
        });
    }
};
export const getOrderInfo_C = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await razorpay.orders.fetch(orderId);
        if (!order) {
            return res.status(500).json({
                success: false,
                error: "Error on razorpay loading",
            });
        }
        res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error,
        });
    }
};
export const getPaymentInfo_C = async (req, res) => {
    const { paymentId } = req.params;
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        if (!payment) {
            return res.status(500).json({
                success: false,
                error: "Error on razorpay loading",
            });
        }
        res.status(200).json({
            success: true,
            data: payment,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error,
        });
    }
};
//# sourceMappingURL=payment.controller.js.map