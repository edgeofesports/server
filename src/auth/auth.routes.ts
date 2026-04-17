import { Router } from "express";
import {
  sendMail,
  sendSms,
  sendVerificationMailForSignUp,
  sendWhatsapp,
  verifyEmailAndOtp,
} from "./auth.controller.js";
import { getPersonalInfo_C } from "../users/user.controller.js";

const authRouter = Router();

authRouter.get('/', getPersonalInfo_C)
authRouter.post("/send/mail", sendMail);
authRouter.post("/send/verificationmail", sendVerificationMailForSignUp);
authRouter.post("/verifyemailandotp", verifyEmailAndOtp);
authRouter.post("/send/sms", sendSms);
authRouter.post("/send/whatsapp", sendWhatsapp);

export { authRouter };
