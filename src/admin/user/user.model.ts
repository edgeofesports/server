import { model, Schema } from "mongoose";

const userSchema = new Schema({
    verified: {
        default: false,
        type: Boolean,
        required: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});


const adminModel = model("admins", userSchema);

export default adminModel