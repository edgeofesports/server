import mongoose, { model } from "mongoose";

interface paymentOrderScheam {
    "id": "order_EKwxwAgItmmXdp",
    "entity": "order",
    "amount": 50000,
    "amount_paid": 0,
    "amount_due": 50000,
    "currency": "INR",
    "receipt": "receipt#1",
    "offer_id": null,
    "status": "created",
    "attempts": 0,
    "notes": [],
    "created_at": 1582628071
  }

const razorpayOrderSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "users"
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    response: {
        type: mongoose.Schema.Types.Mixed
    },
});
const razorpayPaymentSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "users"
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["paid", "failed"],
            message: "status `{VALUE}` not supported"
        }
    },
    response: {
        type: mongoose.Schema.Types.Mixed
    },
});

export const razorpayOrders = model("razorpayOrders", razorpayOrderSchema)
export const razorpayPayments = model("razorpayPayments", razorpayPaymentSchema)