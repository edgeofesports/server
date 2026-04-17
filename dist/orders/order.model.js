import mongoose, { model, Schema } from "mongoose";
const orderSchema = new Schema({
    battle: {
        type: mongoose.Types.ObjectId,
        ref: "battles",
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "unpaid",
        enum: {
            values: ["unpaid", "paid"],
            message: "status `{VALUE}` not supported"
        }
    },
    createBy: {
        type: String,
        ref: "users",
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    members: {
        type: (Array),
        required: true,
        ref: "users"
    }
}, { timestamps: true });
const orderModel = model("orders", orderSchema);
export default orderModel;
//# sourceMappingURL=order.model.js.map