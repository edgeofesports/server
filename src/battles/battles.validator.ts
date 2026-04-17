import { NextFunction, Request, Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { z } from "zod";

export const getSingleBattle_V = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id } = req.params;
  // const schema = z.string({message: "Battle required !"}).length(16, {message: "Invalid battle !"});
  const isValidBattle = isValidObjectId(_id);

  if (isValidBattle) {
    return next();
  }
  res.status(400).json({
    success: false,
    error: "Invalid Battle",
  });
};

export const joinBattle_V = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    // console.log(battle);
    const validSchema = schema.safeParse({
      battle: new mongoose.Types.ObjectId(battle),
      members,
    });

    if (!validSchema.error) {
      next();
    } else {
      res.status(404).json({
        success: false,
        error: validSchema.error.issues[0].message,
      });
    }
  } catch (err: any) {
    // console.log(err);
    res.status(400).json({
      success: false,
      error: err
    });
  }
};
