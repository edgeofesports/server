import mongoose from "mongoose";
const otpSchema = new mongoose.Schema({
    otp: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600,
    },
});
const otpModel = mongoose.model('OTP', otpSchema);
export { otpModel };
//# sourceMappingURL=auth.model.js.map