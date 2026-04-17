import mongoose from "mongoose";
import { string } from "zod";

const notificationSchema = new mongoose.Schema({
  from: {
    type: String,
    ref: "users"
  },
  to: {
    type: String,
    ref: "users",
    required: [true, "to field requried"]
  },
  n_type: {
    type: String,
    required: true,
    enum: {
      values: ["Friend request", "sdjahsjk"],
      message: "`{VALUE}` type not supported"
    }
  },
  message: {
    type: String,
  }
});

const notificationModel = mongoose.model("notifications", notificationSchema)

export default notificationModel;