import mongoose, { isValidObjectId } from "mongoose";
import { z } from "zod";
export const getSingleBattle_V = async (req, res, next) => {
    const { _id } = req.params;
    const isValidBattle = isValidObjectId(_id);
    if (isValidBattle) {
        return next();
    }
    res.status(400).json({
        success: false,
        error: "Invalid Battle",
    });
};
export const joinBattle_V = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(404).json({
            success: false,
            error: "not authorized",
        });
    }
    const { battle, members } = req.body;
    const schema = z.object({
        battle: z.instanceof(mongoose.Types.ObjectId),
        members: z
            .array(z.string())
            .min(1, { message: "Invalid members" })
            .max(4, { message: "Invalid members" }),
    });
    try {
        const validSchema = schema.safeParse({
            battle: new mongoose.Types.ObjectId(battle),
            members,
        });
        if (!validSchema.error) {
            next();
        }
        else {
            res.status(404).json({
                success: false,
                error: validSchema.error.issues[0].message,
            });
        }
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: err
        });
    }
};
//# sourceMappingURL=battles.validator.js.map