import z from "zod";
import jwt from 'jsonwebtoken';
import { razorpayOrders } from "./payment.model.js";
import mongoose from "mongoose";
const jwt_secret = process.env.JWT_SECRET_STR;
export const createOrder_V = async (req, res, next) => {
    const { amount } = req.body;
    const { authorization } = req.headers;
    if (!jwt_secret) {
        return res.status(500).json({
            success: false,
            error: "Invalid jwt secret"
        });
    }
    ;
    if (!authorization) {
        return res.status(400).json({
            success: false,
            error: "unAuthorized"
        });
    }
    if (!amount) {
        return res.status(400).json({
            success: false,
            error: "Enter amount"
        });
    }
    const schema = z.object({
        amount: z.number().min(10, { message: "amount must be greater than or equal to 10" }).max(100000, { message: "amount limit exceed" })
    });
    try {
        let validUserToken;
        try {
            validUserToken = await jwt.verify(authorization, jwt_secret);
            req.body.user = validUserToken;
            req.body.amount = +amount;
        }
        catch (error) {
            return res.status(404).json({
                success: false,
                error: "unAuthorized"
            });
        }
        ;
        const validSchema = schema.safeParse({
            amount: +amount, authorization
        });
        if (validSchema.success) {
            return next();
        }
        if (validSchema.error) {
            return res.status(404).json({
                success: false,
                error: validSchema.error.issues[0].message
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};
export const createPaymenOption_V = async (req, res, next) => {
    const { orderId } = req.params;
    const { authorization } = req.headers;
    if (!jwt_secret) {
        return res.status(500).json({
            success: false,
            error: "Invalid jwt secret"
        });
    }
    ;
    if (!authorization || !orderId) {
        return res.status(400).json({
            success: false,
            error: "unAuthorized"
        });
    }
    try {
        let validUserToken;
        try {
            validUserToken = await jwt.verify(authorization, jwt_secret);
            req.body.user = validUserToken;
        }
        catch (error) {
            return res.status(404).json({
                success: false,
                error: "unAuthorized"
            });
        }
        ;
        const order = await razorpayOrders.aggregate([
            {
                '$match': {
                    '$and': [
                        {
                            'orderId': orderId
                        }, {
                            'createdBy': new mongoose.Types.ObjectId(req.body.user.id)
                        }
                    ]
                }
            }
        ]);
        if (order.length === 1) {
            req.body.order = order[0];
            return next();
        }
        ;
        return res.status(400).json({
            success: false,
            error: "order not found"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message ? error.message : error
        });
    }
};
export const razorpayPaymentHandler_V = async (req, res, next) => {
    const { response, status } = req.body;
    const { authorization } = req.headers;
    const scheam = z.object({
        authorization: z.string(),
        status: z.enum(["paid", "failed"])
    });
    try {
        try {
            if (!authorization || !jwt_secret) {
                return res.status(404).json({
                    success: false,
                    error: "unAuthorized"
                });
            }
            const decodedUser = jwt.verify(authorization, jwt_secret);
            req.body.user = decodedUser;
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                error: error.message ? error.message : error
            });
        }
        const validSchema = scheam.safeParse({
            authorization, status
        });
        if (validSchema.success) {
            return next();
        }
        if (validSchema.error) {
            return res.status(404).json({
                success: false,
                error: validSchema.error.message ? validSchema.error.message : validSchema.error
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message ? error.message : error
        });
    }
};
//# sourceMappingURL=payment.validator.js.map