import { error } from "console";
import e, { NextFunction, Request, Response } from "express";
import z from "zod";

const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const name = req.body.name?.trim();
  const otp = req.body.otp;
  const userName = req.body.userName?.trim();
  const email = req.body.email?.trim();
  const ffUid = req.body.ffUid;
  const ffUserName = req.body.ffUserName?.trim();
  const password = req.body.password?.trim();
  const confirmPassword = req.body.confirmPassword?.trim();

  const schema = z.object({
    name: z
      .string({ message: "name required!" })
      .min(3, { message: "name must be min 3 character long." })
      .max(50, { message: "name must be less then 50 character." }),
    userName: z.string({ message: "userName required!" }).min(3).max(50),
    // phone: z.number({message: "Invalid phone"}).min(999999999, {message: "Invalid Phone"}).max(9999999999, {message: "Invalid phone!"}),
    email: z
      .string({ message: "email required!" })
      .email({ message: "invaild email" }),
    ffUid: z.coerce.number({
      invalid_type_error: "Invalid ffUid!",
      required_error: "ffUid is required",
    }),
    otp: z.coerce.number({
      invalid_type_error: "Invalid otp!",
      required_error: "otp is required",
    }),
    ffUserName: z.string({ message: "Invalid ffUserName!" }),
    password: z
      .string({ message: "password required!" })
      .min(4, { message: "password must be greater than 4 character" })
      .max(50, { message: "password must be smaller then 50 digits" }),
    confirmPassword: z
      .string({ message: "password required!" })
      .min(4, { message: "password must be greater than 4 character" })
      .max(50, { message: "password must be smaller then 50 digits" }),
  });
  const validReq = schema.safeParse({
    name,
    userName,
    email,
    ffUid,
    password,
    ffUserName,
    confirmPassword,
    otp,
  });

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: `password and confirmPassword doesn't matched!`,
    });
  }
  if (!validReq.error) {
    return next();
  }
  res.status(400).json({
    success: false,
    error: validReq.error?.issues[0].message,
  });
};

export const loginUser_V = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const phone = req.body.phone?.trim();
  const email = req.body.email?.trim();
  const password = req.body.password.trim();

  if (!email && !phone) {
    return res.status(400).json({
      sucess: false,
      error: "phone or email required!",
    });
  }
  const schema = z.object({
    phone: z
      .number()
      .min(999999999, { message: "Invalid phone !" })
      .max(9999999999, { message: "Invalid phone !" })
      .optional(),
    email: z.string().email({ message: "Invalid email" }).optional(),
    password: z.string({ message: "password required!" }),
  });
  const validReq = schema.safeParse({ phone, email, password });
  if (!validReq.error) {
    return next();
  }

  res.status(400).json({
    success: false,
    error: validReq.error?.issues[0].message,
  });
};

// export const getPersonalInfo_V = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { authorization } = req.headers;
//   if (!authorization) {
//     return res.status(400).json({
//       success: false,
//       error: "not authorized !",
//     });
//   }
//   const schema = z.string({ message: "invalid User !" });
//   try {
//     const validSchema = schema.safeParse(authorization);
//     if (validSchema.success) {
//       return next();
//     }
//     res.status(400).json({
//       success: false,
//       error: validSchema.error,
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: "invalid user !",
//     });
//   }
// };

export const findUser_V = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  next();
};

export const getAllFriends_V = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { authorization } = req.headers;

  const schema = z.string({ message: "not authorized" });
  try {
    const verified = schema.safeParse(authorization);
    if (verified.success) {
      return next();
    } else {
      return res.status(404).json({
        success: false,
        error: "unauthorized",
      });
    }
  } catch (err) {
    res.status(404).json({
      success: false,
      error: "not authorized !",
    });
  }
};

export const requestWithdrawal_V = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { upiId, confirmUpiId, contactPhone, otp, amount } = req.body;
  const { authorization } = req.headers;

  try {
    const schma = z.object({
      upiId: z.string({ message: "upi id required" }),
      confirmUpiId: z.string({ message: "confirm upi id required" }),
      contactPhone: z
        .string({ message: "contact phone required" })
        .length(10, { message: "Invalid contact phone" }),
      otp: z.string(),
      amount: z.number({ message: "amount required" }),
      authorization: z.string({ message: "unAuthorized" }),
    });
    const validSchema = schma.safeParse({
      upiId,
      confirmUpiId,
      contactPhone,
      otp,
      amount,
      authorization,
    });
    if (validSchema.success) {
      return next();
    }

    return res.status(400).json({
      success: false,
      error: validSchema.error.issues[0].message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error,
    });
  }
};

export { validateRegistration };
