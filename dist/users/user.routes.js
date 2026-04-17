import { Router } from "express";
import { findUser_V, getAllFriends_V, loginUser_V, requestWithdrawal_V, validateRegistration } from "./user.validator.js";
import { createNewPassword_C, findUser_C, forgotPassword_C, getAllFriends_C, getPersonalInfo_C, getSampleUsers_C, loginUser_C, registerUser, requestWithdrawal_C } from "./user.controller.js";
const userRouter = Router();
userRouter.post("/auth/login", loginUser_V, loginUser_C);
userRouter.post("/auth/register", validateRegistration, registerUser);
userRouter.get("/get/:user", findUser_V, findUser_C);
userRouter.get("/", getPersonalInfo_C);
userRouter.get("/get-friends/all", getAllFriends_V, getAllFriends_C);
userRouter.get("/get/random/sample", getSampleUsers_C);
userRouter.post("/forgotpassword", forgotPassword_C);
userRouter.post("/new-password", createNewPassword_C);
userRouter.post("/request/withdrawal", requestWithdrawal_V, requestWithdrawal_C);
export { userRouter };
//# sourceMappingURL=user.routes.js.map