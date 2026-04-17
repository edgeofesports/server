import { Router } from "express";
import battleRouter from "./battle/battle.routes.js";
import userRouter from "./user/user.routes.js";
import withdrawalRouter from "./withdrawal/withdrawal.routes.js";
const adminRouter = Router();
adminRouter.use((req, res, next) => {
    const { authorization } = req.headers;
    if (authorization === "#*${dheeraj.eow.dev}*:)") {
        next();
    }
    else {
        res.status(404).json({
            success: false,
            error: "Not Authorized"
        });
    }
    ;
});
adminRouter.use("/battle", battleRouter);
adminRouter.use("/user", userRouter);
adminRouter.use("/withdrawal", withdrawalRouter);
export default adminRouter;
//# sourceMappingURL=admin.routes.js.map