import jwt from "jsonwebtoken";
import battleModel from "./battles.model.js";
import mongoose, { Types } from "mongoose";
import { userModel } from "../users/user.model.js";
import orderModel from "../orders/order.model.js";
const jwt_secret = process.env.JWT_SECRET_STR || "7#D9g5F@6pU2q%V9sZ1yL*8sK$kG3e!Xb6F9qD+LzJ9uPzA%wH2J3x7XsQnS+*4tM8K3A6h1Tb5zR!zCvPq";
export const getAllBattles = async (req, res) => {
    const { authorization } = req.headers;
    const currentTime = new Date().getTime();
    try {
        if (authorization && jwt_secret && authorization !== "undefined") {
            let decodedToken;
            try {
                decodedToken = jwt.verify(authorization, jwt_secret);
            }
            catch (error) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid jwt token"
                });
            }
            const { userName } = decodedToken;
            const battle = await battleModel.aggregate([
                {
                    $addFields: {
                        tmpOrder: {
                            $rand: {},
                        },
                    },
                },
                {
                    $sort: {
                        tmpOrder: 1,
                    },
                },
                {
                    $match: {
                        $nor: [
                            {
                                teams: {
                                    $elemMatch: {
                                        $elemMatch: {
                                            $eq: userName,
                                        },
                                    },
                                },
                            },
                            {
                                teamswithUserName: {
                                    $elemMatch: {
                                        $elemMatch: {
                                            $eq: userName,
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
                {
                    $match: {
                        "expire.id": {
                            $gte: currentTime
                        }
                    }
                }
            ]);
            res.status(200).json({
                success: true,
                length: battle.length,
                data: battle,
            });
        }
        else {
            const battle = await battleModel.aggregate([
                {
                    $addFields: {
                        tmpOrder: {
                            $rand: {},
                        },
                    },
                },
                {
                    $sort: {
                        tmpOrder: 1,
                    },
                },
                {
                    $match: {
                        "expire.id": {
                            $gte: currentTime
                        }
                    }
                }
            ]);
            res.status(200).json({
                success: true,
                length: battle.length,
                data: battle,
            });
        }
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "something went wrong!",
        });
    }
};
export const getSingleBattle_C = async (req, res) => {
    const { _id } = req.params;
    try {
        const battle = await battleModel.findById(_id);
        if (!battle) {
            return res.status(404).json({
                success: false,
                error: "battle not found !",
            });
        }
        res.status(200).json({
            success: true,
            data: battle,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err,
        });
    }
};
export const joinBattle_C = async (req, res) => {
    const { authorization } = req.headers;
    const { battle, members } = req.body;
    if (!authorization) {
        return res.status(400).json({
            success: false,
            error: "unAuthorized",
        });
    }
    const battleInfo = await battleModel.findOne({ _id: battle });
    if (!battleInfo) {
        return res.status(400).json({
            success: false,
            error: "battle not found",
        });
    }
    try {
        const decodedUser = jwt.verify(authorization, jwt_secret);
        const { userName } = decodedUser;
        const userDetails = await userModel.findOne({ userName });
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                error: "unAuthorized !",
            });
        }
        if (battleInfo.entry < userDetails.balance) {
            return res.status(400).json({
                success: false,
                error: "Insufficient Balance !",
            });
        }
        const memberSet = new Set(members);
        memberSet.add(userName);
        const updatedMember = Array.from(memberSet);
        const { settings: { slots }, } = battleInfo;
        if (48 / slots !== updatedMember.length) {
            return res.status(404).json({
                success: false,
                error: "Invalid Team members",
            });
        }
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const battleup = await battleModel.updateOne({ _id: battle }, {
                $addToSet: { teams: updatedMember },
            }, { session, raw: false });
            await userModel.updateOne({ userName: authorization }, {
                $inc: { balance: -battleInfo.entry },
            }, { session });
            await session.commitTransaction();
            await session.endSession();
            res.status(200).json({
                success: true,
                data: "Join successfully",
            });
        }
        catch (err) {
            await session.abortTransaction();
            await session.endSession();
            res.status(400).json({
                success: false,
                error: err,
            });
        }
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: "unAuthorized !",
        });
    }
};
export const getRegisteredBattle_C = async (req, res) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(400).json({
            success: false,
            error: "unAuthorized !",
        });
        ;
    }
    try {
        let decodedToken;
        try {
            decodedToken = await jwt.verify(authorization, jwt_secret);
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                error: "unauthorized"
            });
        }
        ;
        const { userName } = decodedToken;
        const data = await battleModel.aggregate([
            {
                $match: {
                    $or: [
                        { teams: {
                                $elemMatch: {
                                    $elemMatch: {
                                        $eq: userName,
                                    },
                                },
                            } },
                        { teamswithUserName: {
                                $elemMatch: {
                                    $elemMatch: {
                                        $eq: userName,
                                    },
                                },
                            } },
                    ]
                },
            },
            {
                $match: {
                    $nor: [
                        { status: "completed" }
                    ]
                }
            }
        ]);
        res.status(200).json({
            success: true,
            data: {
                length: data.length,
                battles: data
            }
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err,
        });
    }
};
export const createBattleOrder = async (req, res) => {
    const { authorization } = req.headers;
    const { battle, members, UserNameMembers } = req.body;
    if (!authorization) {
        return res.status(400).json({
            success: false,
            error: "unAuthorized",
        });
    }
    const battleInfo = await battleModel.findOne({ _id: battle });
    if (!battleInfo) {
        return res.status(400).json({
            success: false,
            error: "battle not found",
        });
    }
    if (battleInfo.settings.slots <= battleInfo.teams.length) {
        return res.status(400).json({
            success: false,
            error: "Max Team Reached",
        });
    }
    try {
        const decodedUser = jwt.verify(authorization, jwt_secret);
        const { userName, ffUserName } = decodedUser;
        const userDetails = await userModel.findOne({ userName });
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                error: "unAuthorized user!",
            });
        }
        ;
        const isAlreadyJoined = await orderModel.aggregate([
            {
                $match: {
                    $and: [
                        {
                            battle: new Types.ObjectId(battle)
                        },
                        {
                            createBy: userName
                        }
                    ]
                }
            }
        ]);
        if (isAlreadyJoined.length >= 1) {
            return res.status(404).json({
                success: false,
                error: "Already Joined !"
            });
        }
        ;
        if (battleInfo.entry > userDetails.balance) {
            return res.status(400).json({
                success: false,
                error: "Insufficient Balance !",
            });
        }
        const memberSet = new Set(members);
        memberSet.add(ffUserName);
        const updatedMember = Array.from(memberSet);
        const UserNameMemberSet = new Set(UserNameMembers);
        UserNameMemberSet.add(userName);
        const updatedUserNameMembers = Array.from(UserNameMemberSet);
        const { settings: { slots }, } = battleInfo;
        if ((battleInfo.settings.gameMode === "Battle Royal" && 48 / slots !== updatedMember.length)) {
            return res.status(404).json({
                success: false,
                error: "Invalid Team members",
            });
        }
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const battleupdate = await battleModel.updateOne({ _id: battle }, {
                $addToSet: {
                    teams: updatedMember,
                    teamswithUserName: updatedUserNameMembers
                }
            }, { session, raw: false });
            const order = await orderModel.create([{
                    battle: battle,
                    createBy: userName,
                    userId: userDetails._id,
                    members: [updatedMember]
                }], { session });
            await session.commitTransaction();
            await session.endSession();
            try {
                const response = await fetch(`http://127.0.0.1:5000/transaction/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        apikey: "123@edgeofwaresports.com"
                    },
                    body: JSON.stringify({
                        status: "debited",
                        orderId: order[0]._id,
                        type: "contest fee",
                        value: battleInfo.entry
                    })
                });
                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.error);
                }
                return res.status(200).json({
                    success: true,
                    data: data.data,
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({
                    success: false,
                    error: "error creating transaction"
                });
            }
        }
        catch (err) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({
                success: false,
                error: err.message || "something went wrong"
            });
        }
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: "unAuthorized !",
        });
    }
};
export const getUpcomingBattles_C = async (req, res) => {
    try {
        const battles = await battleModel.aggregate([{
                $match: {
                    status: "upcoming"
                }
            }]);
        res.status(200).json({
            success: true,
            data: {
                length: battles.length,
                battles
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error
        });
    }
};
export const getLiveBattles_C = async (req, res) => {
    try {
        const battles = await battleModel.aggregate([{
                $match: {
                    status: "live"
                }
            }]);
        res.status(200).json({
            success: true,
            data: {
                length: battles.length,
                battles
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error
        });
    }
};
export const getCompletedBattles_C = async (req, res) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(400).json({
            success: false,
            error: "unAuthorized"
        });
    }
    ;
    try {
        let decodedUser;
        try {
            decodedUser = await jwt.verify(authorization, jwt_secret);
            if (!decodedUser) {
                return res.status(400).json({
                    success: false,
                    error: "unAuthorized"
                });
            }
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                error: "unAuthorized"
            });
        }
        const battles = await battleModel.aggregate([
            {
                $match: {
                    status: "completed"
                }
            },
            {
                $match: {
                    $or: [
                        { teams: {
                                $elemMatch: {
                                    $elemMatch: {
                                        $eq: decodedUser.userName,
                                    },
                                },
                            } },
                        { teamswithUserName: {
                                $elemMatch: {
                                    $elemMatch: {
                                        $eq: decodedUser.userName,
                                    },
                                },
                            } },
                    ]
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: {
                length: battles.length,
                battles
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error
        });
    }
};
//# sourceMappingURL=battles.controller.js.map