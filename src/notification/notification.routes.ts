import { Router } from "express";
import { acceptFriendReqest_V, createFriendRequest_V } from "./notification.validator.js";
import { acceptFriendRequest_C, createFriendRequest_C, getAllNotification_C } from "./notification.controller.js";

const notificatonRouter = Router();

notificatonRouter.post("/friend-request/create", createFriendRequest_V, createFriendRequest_C);
notificatonRouter.post("/friend-request/accept", acceptFriendReqest_V, acceptFriendRequest_C);
notificatonRouter.get("/all", getAllNotification_C);

export default notificatonRouter;