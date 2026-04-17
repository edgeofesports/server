import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { userModel } from "./user.model.js";
import { verifyEmailAndOtpLocally } from "../auth/auth.controller.js";
import { otpModel } from "../auth/auth.model.js";
import nodemailer from "nodemailer";
import { withdrawalRequestsModel } from "../transactions/transactions.model.js";
import { JWT_SECRET } from "../env.config.js";
import { ACCESS_TOKEN } from "../constants.js";
export const registerUser = async (req, res) => {
    const { name, otp, userName, email, ffUid, ffUserName, password } = req.body;
    try {
        const verified = await verifyEmailAndOtpLocally({
            email,
            otp: Number(otp),
        });
        if (!verified.success) {
            return res.status(400).json({
                success: false,
                error: `Invalid Otp !!`,
            });
        }
        await otpModel.deleteMany({ email, otp: Number(otp) });
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await userModel.create({
            ffUid,
            ffUserName,
            name,
            userName,
            email,
            password: hashedPassword,
        });
        const { _id, createAt } = user;
        const token = jwt.sign({
            name,
            ffUid,
            userName,
            ffUserName,
            email,
            createAt,
            id: _id,
            profile: "/men.png",
        }, JWT_SECRET);
        res.cookie(ACCESS_TOKEN, token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            data: {
                token,
                userName,
            },
        });
    }
    catch (err) {
        const key = Object.keys(err.keyValue)[0];
        res.status(400).json({
            success: false,
            error: `user already exist with given ${key}`,
        });
    }
};
export const loginUser_C = async (req, res) => {
    const phone = req.body.phone?.trim();
    const email = req.body.email?.trim();
    const password = req.body.password.trim();
    try {
        const credentialToFind = (phone && { phone }) || (email && { email });
        const user = await userModel.findOne(credentialToFind);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, error: "please sign up first." });
        }
        const { _id, name, ffUid, userName, createAt, profile, ffUserName } = user;
        const passMatch = await bcrypt.compare(password, user.password);
        if (!passMatch) {
            return res
                .status(404)
                .json({ success: false, error: "password doesn't matched!" });
        }
        const token = jwt.sign({
            name,
            ffUid,
            userName,
            createAt,
            id: _id,
            profile: "/men.png",
            email,
            ffUserName,
        }, JWT_SECRET);
        res.cookie(ACCESS_TOKEN, token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            data: {
                token,
                userName,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};
export const getPersonalInfo_C = async (req, res) => {
    const accessToken = req.cookies[ACCESS_TOKEN];
    if (!accessToken) {
        return res.status(404).json({
            success: false,
            error: "unAuthorized",
        });
    }
    try {
        const verifiedToken = jwt.verify(accessToken, JWT_SECRET);
        const user = await userModel.findById(verifiedToken?.id);
        if (user) {
            return res.status(200).json({
                success: true,
                data: user,
            });
        }
        return res.status(404).json({
            success: false,
            error: "user not found",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(404).json({
            success: false,
            error: "unAuthorized",
        });
    }
};
export const findUser_C = async (req, res) => {
    const { user } = req.params;
    try {
        const userFound = await userModel.aggregate([
            {
                $match: {
                    $or: [
                        {
                            userName: user,
                        },
                        {
                            ffUid: parseInt(user),
                        },
                    ],
                },
            },
            {
                $project: {
                    name: 1,
                    ffUid: 1,
                    _id: 1,
                    profile: 1,
                    userName: 1,
                },
            },
        ]);
        if (userFound.length) {
            return res.status(200).json({
                success: true,
                data: userFound,
            });
        }
        res.status(400).json({
            success: false,
            error: "user not found !",
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};
export const getSingleUser = async (req, res) => {
    const { user } = req.params;
    const { authorizaton: authToken } = req.headers;
    if (!user || !authToken) {
        return res
            .status(404)
            .json({ success: false, message: "please enter all required fields." });
    }
    try {
        const verifiedToken = jwt.verify(authToken, JWT_SECRET);
        const verifiedUser = await userModel.findById(verifiedToken._id);
        if (!verifiedUser) {
            return res
                .status(404)
                .json({ success: false, message: "user not found...." });
        }
        if (verifiedToken._id !== user) {
            return res
                .status(401)
                .json({ success: false, message: "unauthorized...." });
        }
        res.status(200).json({ success: true, user: verifiedUser });
    }
    catch (err) {
        res.status(403).json({ success: false, message: "invalid user" });
    }
};
export const resetPass = async (req, res) => {
    const { phone, email, newPassword } = req.body;
    if ((!phone && !email) || !newPassword) {
        return res
            .status(404)
            .json({ success: false, message: "please provide all fields." });
    }
    try {
        const field = (phone && { phone }) || (email && { email });
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const updatedUser = await userModel.updateOne(field, {
            $set: { password: hashedPassword },
        });
        if (updatedUser.matchedCount !== 1) {
            return res
                .status(404)
                .json({ success: false, message: "please sign up first." });
        }
        if (updatedUser.modifiedCount !== 1) {
            return res
                .status(500)
                .json({ success: false, message: "please try again." });
        }
        res.status(200).json({
            success: true,
            user: "password reset successfully, you can proceed with login.",
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
export const updateUserData = async (req, res) => {
    const { user } = req.params;
    const { authorization: authToken } = req.headers;
    let { newName, newUserName, newffUid } = req.body;
    if (!newName && !newUserName && !newffUid) {
        return res
            .status(422)
            .json({ success: false, message: "please provide atleast one field." });
    }
    try {
        const verifiedToken = jwt.verify(authToken, JWT_SECRET);
        const verifiedUser = await userModel.findById(verifiedToken._id);
        if (!verifiedUser || user !== verifiedUser?._id.toHexString()) {
            return res.status(404).json({ success: false, message: "invalid user" });
        }
        newName = newName ? newName : verifiedUser?.name;
        newUserName = newUserName ? newUserName : verifiedUser.userName;
        newffUid = newffUid ? newffUid : verifiedUser?.ffUid;
        const updatedUser = await userModel.updateOne({ _id: verifiedUser._id }, { $set: { name: newName, ffUid: newffUid, userName: newUserName } });
        if (updatedUser.modifiedCount !== 1) {
            return res
                .status(203)
                .json({ success: false, message: "rest to default..." });
        }
        res.status(200).json({ success: true, message: "changed successfully." });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "invalid user",
        });
    }
};
export const getAllFriends_C = async (req, res) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(400).json({
            success: false,
            error: "unauthorized",
        });
    }
    try {
        let decodedToken;
        try {
            decodedToken = jwt.verify(authorization, JWT_SECRET);
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                error: "unauthorized",
            });
        }
        const { id } = decodedToken;
        const friends = await userModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(`${id}`),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "friends.allFriends",
                    foreignField: "userName",
                    as: "friend_details",
                },
            },
            {
                $project: {
                    "friend_details.userName": 1,
                    "friend_details.profile": 1,
                    "friend_details.ffUid": 1,
                    "friend_details.name": 1,
                    "friend_details.ffUserName": 1,
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: {
                length: friends[0].friend_details.length,
                friends: friends[0].friend_details,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: "something went wrong !",
        });
    }
};
export const getSampleUsers_C = async (req, res) => {
    try {
        const samples = await userModel.aggregate([
            {
                $sample: {
                    size: 15,
                },
            },
            {
                $project: {
                    _id: 0,
                    ffUid: 1,
                    profile: 1,
                    userName: 1,
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: samples,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: "something went wrong !",
        });
    }
};
export const forgotPassword_C = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(404).json({
            success: false,
            error: "Invalid Mail",
        });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: "user not found",
            });
        }
        const { name, ffUid, userName, ffUserName, createAt, _id } = user;
        const token = await jwt.sign({
            name,
            ffUid,
            userName,
            createAt,
            id: _id,
            profile: "/men.png",
            email,
            ffUserName,
        }, JWT_SECRET);
        const link = `https://edgeofesports.com/new-password/${token}`;
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "edgeofesports@gmail.com",
                pass: "bqfj gbci xlgi esid",
            },
        });
        let mailOptions = {
            from: "edge of eSports<mail@edgeofesports.com>",
            to: email,
            subject: "Password Reset Link",
            html: `
          <div>
            <p>Your password reset Link is below valid for last 10 min</p>
            <div>
              <a href="${link}" >${link}</a>
            </div>
          </div>
        `,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    error,
                });
            }
            res.status(200).json({
                success: true,
                data: info,
            });
        });
    }
    catch {
        res.status(500).json({
            success: false,
            error: "Something went Wrong",
        });
    }
};
export const createNewPassword_C = async (req, res) => {
    const { authorization } = req.headers;
    const { linkToken, newPassword, confirmNewPassword, oldPassword } = req.body;
    if (!(newPassword && confirmNewPassword) ||
        newPassword !== confirmNewPassword) {
        return res.status(400).json({
            success: false,
            error: "password and newPassword does not matched",
        });
    }
    if (linkToken) {
        try {
            const verifiedToken = jwt.verify(linkToken, JWT_SECRET);
            if (!verifiedToken && verifiedToken.email && verifiedToken.iat) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid link",
                });
            }
            const userDetails = await userModel.findOne({
                email: verifiedToken.email,
            });
            if (!userDetails) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid link",
                });
            }
            try {
                const newHashedPassword = await bcrypt.hash(newPassword, 12);
                await userModel.findOneAndUpdate({ _id: userDetails._id }, { password: newHashedPassword });
                return res.status(200).json({
                    success: true,
                    data: "password updated successfully",
                });
            }
            catch (error) {
                return res.status(400).json({
                    success: false,
                    error: "error creating new password",
                });
            }
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                error: "unAuthorized",
            });
        }
    }
    else if (oldPassword) {
        if (!authorization) {
            return res.status(400).json({
                success: false,
                error: "unAuthorized",
            });
        }
        const decodedToken = jwt.verify(authorization, JWT_SECRET);
        if (!decodedToken && decodedToken.email) {
            return res.status(400).json({
                success: false,
                error: "unAuthorized",
            });
        }
        const verifiedUser = await userModel
            .findOne({ email: decodedToken.email })
            .select("password");
        if (!verifiedUser) {
            return res.status(400).json({
                success: false,
                error: "unAuthorized",
            });
        }
        try {
            const passMatch = await bcrypt.compare(oldPassword, verifiedUser.password);
            if (!passMatch) {
                return res.status(404).json({
                    success: false,
                    error: "old password does not matched, try forgot password",
                });
            }
            if (passMatch) {
                try {
                    const newHashedPassword = await bcrypt.hash(newPassword, 12);
                    await userModel.findOneAndUpdate({ _id: verifiedUser._id }, { password: newHashedPassword });
                    return res.status(200).json({
                        success: true,
                        data: "password updated successfully",
                    });
                }
                catch (error) {
                    return res.status(400).json({
                        success: false,
                        error: "error creating new password",
                    });
                }
            }
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                error: "unAuthorized",
            });
        }
    }
    else {
        return res.status(400).json({
            success: false,
            error: "Invalid request",
        });
    }
};
export const requestWithdrawal_C = async (req, res) => {
    const { upiId, confirmUpiId, contactPhone, otp, amount } = req.body;
    const { authorization } = req.headers;
    const session = await mongoose.startSession();
    await session.startTransaction();
    try {
        if (upiId !== confirmUpiId) {
            return res.status(404).json({
                success: false,
                error: "upi id and confirm upi id does not matched",
            });
        }
        let verifiedToken;
        try {
            if (!authorization) {
                return res.status(400).json({
                    success: false,
                    error: "unAuthorized",
                });
            }
            verifiedToken = jwt.verify(authorization, JWT_SECRET);
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                error: "unAuthorized",
            });
        }
        if (!verifiedToken && !verifiedToken.email) {
            return res.status(400).json({
                success: false,
                error: "Try login again",
            });
        }
        const userDetails = await userModel.findOne({
            userName: verifiedToken.userName,
        });
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                error: "user not found",
            });
        }
        if (userDetails.balance < amount) {
            return res.status(404).json({
                success: false,
                error: "requested amount exceed",
            });
        }
        const databaseOtp = await otpModel.findOne({ email: userDetails.email });
        if (!databaseOtp || +databaseOtp.otp !== +otp) {
            return res.status(400).json({
                success: false,
                error: "Invalid Otp, Try sending again!",
            });
        }
        const withdrawalRequest = await withdrawalRequestsModel.create([
            {
                createdBy: userDetails._id,
                amount: +amount,
                upiId,
                otp,
                contactPhone,
                status: "requested",
            },
        ], { session });
        const upatedUser = await userModel.updateOne({ _id: userDetails._id }, {
            $inc: { balance: -+amount },
        }, { session });
        if (withdrawalRequest) {
            await session.commitTransaction();
            await session.endSession();
            return res.status(200).json({
                success: true,
                data: "request sent successfully",
            });
        }
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
            success: false,
            error: "somthing went wrong, contact support!",
        });
    }
    catch (error) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(500).json({
            success: false,
            error: "Internal server error, contact support!",
        });
    }
};
//# sourceMappingURL=user.controller.js.map