import { config } from 'dotenv';
import express, { NextFunction, Request, Response } from 'express'

config();
import cors from 'cors'
import battleRouter from './battles/battles.routes.js';
import { userRouter } from './users/user.routes.js';
import notificatonRouter from './notification/notification.routes.js';
import validateapikey from './middlewares/apikeyvalidator.js';
import adminRouter from './admin/admin.routes.js';
import { authRouter } from './auth/auth.routes.js';
import { transactionRouter } from './transactions/transactions.routes.js';
import paymentRouter from './payment/payment.routes.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors());
app.use(validateapikey);
app.use(cookieParser())

app.use((req, res, next)=>{
  const { authorization } = req.headers;
  if(authorization!=="undefined"){
    next();
    return;
  }
  res.status(404).json({
    success: false,
    error: "unAutorized"
  })
})

app.use(express.json({
  limit: 5000000
}), (error:any, req:Request, res:Response, next:NextFunction)=>{
  if (error) {
    return res.status(400).json({ 
      success: false,
      error
    });
  }
  next();
});
app.use("/battle", battleRouter)
app.use("/user", userRouter)
app.use("/notification", notificatonRouter)
app.use("/admin", adminRouter)
app.use("/auth", authRouter)
app.use("/transaction", transactionRouter)
app.use("/payments", paymentRouter)

app.all('*', (req, res)=>{
  res.status(404).json({
    success: false,
    error: "route not found!"
  })
});

app.use((err:any, req:any, res:any, next:any)=>{
  if(err){
    return res.status(500).json({
      success: false,
      error: "internal server error!"
    })
  }
});



export default app;