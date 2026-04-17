import { NextFunction, Request, Response } from "express";

export const hostBattle_V = async (req: Request, res: Response, next: NextFunction) => {
    const { roomId, roomPass } = req.body;
    const { battle } = req.params;

    if(roomId && roomPass && battle){
        return next();
    };
    res.status(400).json({
        success: false,
        error: "Invalid body Data!"
    });
}