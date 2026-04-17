import { Request, Response } from "express";
import { withdrawalRequestsModel } from "../../transactions/transactions.model.js";

export const getAllWithdrawalRequest = async (req: Request, res: Response) => {
    
    try {
        const allRequest = await withdrawalRequestsModel.find();
        return res.status(200).json({
            success: true,
            data: {
                length: allRequest.length,
                allRequest
            }
        })
    } catch (error :any) {
        return res.status(400).json({
            success: false,
            error: error.message?error.message:error || "Internal server error"
        })
    }
};

export const acceptWithdrawal = async (req: Request, res: Response) => {
    const { withdrawalId, utr, creditedTo, creditedBy, creditedAmount  } = req.body;

    try {
        if(!(withdrawalId&&utr&&creditedAmount&&creditedBy&&creditedTo)){
            return res.status(400).json({
                success: false,
                error: "all fields required, by server"
            })
        }
        const updtedRequest = await withdrawalRequestsModel.findOneAndUpdate({ _id: withdrawalId }, { 
            status: "completed",
            utr, creditedAmount, creditedBy, creditedTo
        }, { returnOriginal: false }); 
        return res.status(200).json({
            success: true,
            data: {
                message: "Accepted successfully",
                updtedRequest
            },
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            error
        })
    }

}