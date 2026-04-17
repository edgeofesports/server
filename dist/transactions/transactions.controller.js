import transactionModel, { withdrawalRequestsModel } from "./transactions.model.js";
import mongoose from "mongoose";
import orderModel from "../orders/order.model.js";
import { userModel } from "../users/user.model.js";
import { razorpayOrders } from "../payment/payment.model.js";
import battleModel from "../battles/battles.model.js";
import jwt from 'jsonwebtoken';
import { config } from "dotenv";
config();
const jwt_secret = process.env.JWT_SECRET_STR ||
    "7#D9g5F@6pU2q%V9sZ1yL*8sK$kG3e!Xb6F9qD+LzJ9uPzA%wH2J3x7XsQnS+*4tM8K3A6h1Tb5zR!zCvPq";
export const createTransaction_C = async (req, res) => {
    const { status, type, value, orderId, razorpayOrderId } = req.body;
    if (!(orderId || razorpayOrderId)) {
        return res.status(400).json({
            success: false,
            error: "order id required",
        });
    }
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
        let order;
        if (orderId) {
            try {
                order = await orderModel.findOneAndUpdate({ _id: orderId }, {
                    status: "paid",
                }, { session });
                if (!order) {
                    return res.status(404).json({
                        success: false,
                        error: "order not found",
                    });
                }
            }
            catch (error) {
                return res.status(400).json({
                    success: false,
                    error: "invalid order",
                });
            }
        }
        else if (razorpayOrderId) {
            try {
                order = await razorpayOrders.findOne({ orderId: razorpayOrderId });
                if (!order) {
                    return res.status(404).json({
                        success: false,
                        error: "order not found",
                    });
                }
                order.userId = order.createdBy;
            }
            catch (error) {
                return res.status(400).json({
                    success: false,
                    error: "invalid order",
                });
            }
        }
        const incrementalBalance = status === "credited" ? +value : -value;
        const user = await userModel.findOneAndUpdate({ _id: order.userId }, {
            $inc: {
                balance: incrementalBalance,
            },
        }, { session });
        if (!user) {
            throw new Error("user not found");
        }
        await transactionModel.create([
            {
                status,
                orderId,
                type,
                value: +value,
                lastBalance: user.balance,
                currentBalance: +user.balance + incrementalBalance,
            },
        ], { session });
        res.status(200).json({
            success: true,
            data: "transaction completed",
        });
        await session.commitTransaction();
        session.endSession();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error,
        });
        await session.abortTransaction();
        session.endSession();
    }
};
export const crTransactionByAdmin_C = async (req, res) => {
    const { user, battle, value } = req.body;
    const { authorization } = req.headers;
    if (authorization !== "#*${dheeraj.eow.dev}*:)") {
        return res.status(400).json({
            success: false,
            error: "unAuthorized"
        });
    }
    if (!value || +value < 1) {
        return res.status(404).json({
            success: false,
            error: "Invalid prize"
        });
    }
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
        const userDetails = await userModel.findOne({ _id: user });
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                error: "user not found"
            });
        }
        ;
        const battleDetails = await battleModel.findOne({ _id: battle });
        if (!battleDetails) {
            return res.status(404).json({
                success: false,
                error: "battle not found"
            });
        }
        ;
        await transactionModel.create([{
                type: "winning prize",
                status: "credited",
                battleId: battleDetails._id,
                createdTo: userDetails._id,
                createdBy: "admin.dheeraj",
                lastBalance: userDetails.balance,
                value: +value,
                currentBalance: userDetails.balance + value
            }], { session });
        await userModel.updateOne({ _id: userDetails._id }, {
            $inc: { balance: +value }
        }, { session });
        session.commitTransaction();
        session.endSession();
        res.status(200).json({
            success: true,
            data: "transaction Created Successfully"
        });
    }
    catch (error) {
        session.abortTransaction();
        session.endSession();
        res.status(400).json({
            success: false,
            error
        });
    }
};
export const createWithdrawalRequest_C = async (req, res) => {
    const { amount } = req.body;
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(400).json({
            success: false,
            error: "unAuthorized"
        });
    }
    if (!amount || +amount < 1) {
        return res.status(400).json({
            success: false,
            error: "amount should be more than 1"
        });
    }
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
        const decodedUser = jwt.verify(authorization, jwt_secret);
        const userDetails = await userModel.findOne({ _id: decodedUser.id });
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                error: "user not found"
            });
        }
        ;
        if (+userDetails.balance < +amount) {
            return res.status(404).json({
                success: false,
                error: "request amount excced"
            });
        }
        ;
        await withdrawalRequestsModel.create([{
                createdBy: userDetails._id,
                amount: +amount
            }], { session });
        await transactionModel.create([{
                status: "debited",
                type: "withdrawal",
                createdBy: userDetails._id,
                createdTo: userDetails._id,
                value: +amount,
                lastBalance: userDetails.balance,
                currentBalance: +userDetails.balance + -amount
            }], { session });
        await userModel.findOneAndUpdate({
            _id: userDetails._id
        }, { $inc: { balance: -+amount } }, { session });
        await session.commitTransaction();
        await session.endSession();
        return res.status(200).json({
            success: true,
            data: "withdrawal request sent"
        });
    }
    catch (error) {
        console.log(error);
        await session.abortTransaction();
        await session.endSession();
        res.status(400).json({
            success: false,
            error: error.message ? error.message : error
        });
    }
};
export const getAllTransactions_C = async (req, res) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(404).json({
            success: false,
            error: "unAuthorized"
        });
    }
    ;
    try {
        const decodedUser = jwt.verify(authorization, jwt_secret);
        const transactions = await transactionModel.aggregate([
            {
                '$match': {
                    'createdTo': new mongoose.Types.ObjectId(decodedUser.id)
                }
            }
        ]);
        res.status(200).json({
            success: true,
            data: {
                length: transactions.length,
                transactions
            }
        });
    }
    catch (error) {
    }
};
//# sourceMappingURL=transactions.controller.js.map