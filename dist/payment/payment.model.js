import mongoose, { model } from "mongoose";
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
export const razorpayOrders = model("razorpayOrders", razorpayOrderSchema);
export const razorpayPayments = model("razorpayPayments", razorpayPaymentSchema);
//# sourceMappingURL=payment.model.js.map