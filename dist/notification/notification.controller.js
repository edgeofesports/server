import notificationModel from "./notification.model.js";
import mongoose from "mongoose";
import { userModel } from "../users/user.model.js";
import jwt from "jsonwebtoken";
const jwt_secret = process.env.JWT_SECRET_STR ||
    "MAI_HU_DON_MAI_HU_DON....MUJHE_ROKEGA_KON>?SKLDFJ2934N23MNR09DNMIUAE90UNDAKFIH9OA8U90U9&*_+_89JH898'ASDF";
export const createFriendRequest_C = async (req, res) => {
    const { authorization } = req.headers;
    const { to } = req.body;
    if (!authorization) {
        return res.status(400).json({
            success: false,
            error: "unAuthorized !",
        });
    }
    const decodedUser = jwt.verify(authorization, jwt_secret);
    if (!decodedUser) {
        return res.status(400).json({
            success: false,
            error: "Unauthorized!",
        });
    }
    const { userName } = decodedUser;
    const findReq = await notificationModel.findOne({ from: userName, to });
    if (findReq) {
        return res.status(300).json({
            success: false,
            error: "already sent !",
        });
    }
    try {
        await notificationModel.create({
            from: userName,
            to,
            n_type: "Friend request",
        });
        res.status(200).json({
            success: true,
            data: "request sent !",
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err.message,
        });
    }
};
export const acceptFriendRequest_C = async (req, res) => {
    const { authorization } = req.headers;
    const { from } = req.body;
    if (!authorization) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized request!",
        });
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const decodedUser = jwt.verify(authorization, jwt_secret);
        const { userName } = decodedUser;
        await Promise.all([
            userModel.updateOne({ userName: from }, { $addToSet: { "friends.allFriends": userName } }, { session }),
            userModel.updateOne({ userName }, { $addToSet: { "friends.allFriends": from } }, { session }),
        ]);
        const deleteResult = await notificationModel.deleteOne({ from, to: userName }, { session });
        if (!deleteResult.deletedCount) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                error: "Friend request not found!",
            });
        }
        await session.commitTransaction();
        return res.status(200).json({
            success: true,
            data: "Friend request accepted successfully!",
        });
    }
    catch (err) {
        await session.abortTransaction();
        return res.status(500).json({
            success: false,
            error: err,
        });
    }
    finally {
        session.endSession();
    }
};
export const getAllNotification_C = async (req, res) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(404).json({
            success: false,
            error: "not authorized !",
        });
    }
    const decodedUser = jwt.verify(authorization, jwt_secret);
    if (!decodedUser) {
        return res.status(400).json({
            success: false,
            error: "Unauthorized!",
        });
    }
    ;
    try {
        const notifications = await notificationModel.aggregate([
            {
                $match: {
                    to: decodedUser.userName,
                },
            }
        ]);
        res.status(200).json({
            success: true,
            data: notifications,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};
//# sourceMappingURL=notification.controller.js.map