import { Router } from "express";
import { createAdmin } from "./user.controller.js";
const userRouter = Router();
userRouter.post("/auth/register", createAdmin);
export default userRouter;
//# sourceMappingURL=user.routes.js.map