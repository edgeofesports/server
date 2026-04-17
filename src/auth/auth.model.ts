import mongoose from "mongoose";
import { number, string } from "zod";

// Define your schema
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
    expires: 600, // Document expires after 600 seconds (10 minutes)
  },
});

// otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 6 });


// Create a model from the schema
const otpModel = mongoose.model('OTP', otpSchema);

export { otpModel }