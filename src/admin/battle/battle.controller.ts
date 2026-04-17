import e, { Request, Response } from "express";
import battleModel from "../../battles/battles.model.js";
import mongoose, { mongo } from "mongoose";
import orderModel from "../../orders/order.model.js";
import transactionModel from "../../transactions/transactions.model.js";
import { userModel } from "../../users/user.model.js";

export const createBattleController = async (req: Request, res: Response) => {
  req.body.battleId = 101;
  const data = req.body;

  try {
    const lastDocument = await battleModel.aggregate([
      {
        $sort: { battleId: -1 },
      },
      {
        $limit: 1,
      },
    ]);
    data.battleId = lastDocument[0]?.battleId + 1 || 101;
    const battleCreated = await battleModel.create(data);
    res.status(200).json({
      success: true,
      data: battleCreated,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      error: error,
    });
  }
};

export const getRegisteredBattle = async (req: Request, res: Response) => {
  try {
    const data = await battleModel.aggregate([
      {
        $match: {
          $nor: [{
            status: "completed"
          }]
        }
      },
      {
        $sort: {
          "expire.id": 1,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: {
        length: data.length,
        battles: data,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error,
    });
  }
};

export const hostBattle_C = async (req: Request, res: Response) => {
  const { battle } = req.params;
  const { roomId, roomPass } = req.body;

  try {
    try {
      const data = await battleModel.findOne({ _id: battle });

      if (!data) {
        return res.status(404).json({
          success: false,
          error: "Battle Not Found !",
        });
      }
      const { auth } = data;
      if (auth?.roomId || auth?.roomPass) {
        return res.status(400).json({
          success: false,
          error: "Already Hosted!",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(404).json({
        success: false,
        error: "Battle Not Found !",
      });
    }
    await battleModel.findOneAndUpdate(
      { _id: battle },
      {
        auth: {
          roomId,
          roomPass,
        },
        status: "live",
      },
      { returnOriginal: false }
    );

    res.status(200).json({
      success: true,
      data: "updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error,
    });
  }
};

export const publishPositions_C = async (req: Request, res: Response) => {
  const { battle, positions } = req.body;
  if (!(battle && positions)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Pased data",
    });
  }
  try {
    const updatedBattle = await battleModel.findOneAndUpdate(
      { _id: battle },
      {
        positions,
      },
      { returnOriginal: false }
    );

    return res.status(200).json({
      success: true,
      data: updatedBattle,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message ? error.message : error,
    });
  }
};

export const distributePrizes_C = async (req: Request, res: Response) => {
  const { battleId } = req.body;
  if(!battleId){
    return res.status(404).json({
      success: false,
      error: "battleId required"
    })
  };

  try {
    const battle = await battleModel.findOne({_id: battleId});
    if(!battle){
      throw new Error("battle not found")
    };

    if(battle.status==="completed"){
      throw new Error("Already distributed")
    }
    if(battle.positions.length<1){
      throw new Error("positions not declayered yet!")
    };

    // battle.teamswithUserName.findIndex
    let findUserNameOfWinner_1;
    let findUserNameOfWinner_2;
    let findUserNameOfWinner_3;

    if(battle.positions[0]){
      findUserNameOfWinner_1 = battle.teamswithUserName[battle.teams.findIndex(value => value.includes(battle.positions[0][0]))][0]
    }
    if(battle.positions[1]){
      findUserNameOfWinner_2 = battle.teamswithUserName[battle.teams.findIndex(value => value.includes(battle.positions[1][0]))][0]
    }
    if(battle.positions[2]){
      findUserNameOfWinner_3 = battle.teamswithUserName[battle.teams.findIndex(value => value.includes(battle.positions[2][0]))][0]
    }

    const order_1 = await orderModel.findOne({ createBy: findUserNameOfWinner_1, battle: battleId })
    const order_2 = await orderModel.findOne({ createBy: findUserNameOfWinner_2, battle: battleId })
    const order_3 = await orderModel.findOne({ createBy: findUserNameOfWinner_3, battle: battleId })

    let transaction_1;
    let transaction_2;
    let transaction_3;

    if(order_1){
      const session_1 = await mongoose.startSession();
      await session_1.startTransaction();

      try {
        const user = await userModel.findOneAndUpdate({_id: order_1.userId}, {
          $inc: { balance: +battle.winning._1 }
        }, { session: session_1, returnOriginal: true})
  
        if(user){
          transaction_1 = await transactionModel.create([{
            status: "credited",
            createdBy: "admin.dheeraj",
            createdTo: order_1.userId,
            battleId: battleId,
            type: "winning prize",
            orderId: order_1._id,
            value: battle.winning._1,
            lastBalance: user.balance,
            currentBalance: +user.balance + battle.winning._1,
            position: 1
          }], { session: session_1 })
        };
        await session_1.commitTransaction();
      } catch (error :any) {
        await session_1.abortTransaction();
        return res.status(400).json({
          success: false,
          error: error.message?error.message:error
        })
      }finally{
        await session_1.endSession();
      }
    }
    if(order_2){
      const session_2 = await mongoose.startSession();
      await session_2.startTransaction();

      try {
        const user = await userModel.findOneAndUpdate({_id: order_2.userId}, {
          $inc: { balance: +battle.winning._2 }
        }, { session: session_2, returnOriginal: true})
  
        if(user){
          transaction_2 = await transactionModel.create([{
            status: "credited",
            createdBy: "admin.dheeraj",
            createdTo: order_2.userId,
            battleId: battleId,
            type: "winning prize",
            orderId: order_2._id,
            value: battle.winning._2,
            lastBalance: user.balance,
            currentBalance: +user.balance + battle.winning._2,
            position: 2
          }], { session: session_2 })
        };
        await session_2.commitTransaction();
      } catch (error :any) {
        await session_2.abortTransaction();
        return res.status(400).json({
          success: false,
          error: error.message?error.message:error
        })
      }finally{
        await session_2.endSession();
      }
    }
    if(order_3){
      const session_3 = await mongoose.startSession();
      await session_3.startTransaction();

      try {
        const user = await userModel.findOneAndUpdate({_id: order_3.userId}, {
          $inc: { balance: +battle.winning._3 }
        }, { session: session_3, returnOriginal: true})
  
        if(user){
          transaction_3 = await transactionModel.create([{
            status: "credited",
            createdBy: "admin.dheeraj",
            createdTo: order_3.userId,
            battleId: battleId,
            type: "winning prize",
            orderId: order_3._id,
            value: battle.winning._3,
            lastBalance: user.balance,
            currentBalance: +user.balance + battle.winning._3,
            position: 3
          }], { session: session_3 })
        };
        await session_3.commitTransaction();
      } catch (error :any) {
        await session_3.abortTransaction();
        return res.status(400).json({
          success: false,
          error: error.message?error.message:error
        })
      }finally{
        await session_3.endSession();
      }
    }

    await battleModel.updateOne({
      _id: battleId
    }, { status: "completed" });

    return res.status(200).json({
      success: true,
      data: {
        message: "Transactions Completed",
        transaction_1, transaction_2, transaction_3
      }
    })


  } catch (error :any) {
    return res.status(404).json({
      success: false,
      error: error.message?error.message:error
    })
  }
};
  

// const handleTransaction = async (userId, prize, position, battleId, orderId) => {
//   const session = await mongoose.startSession();
//   await session.startTransaction();

//   try {
//     const user = await userModel.findOneAndUpdate({ _id: userId }, { $inc: { balance: prize } }, { session, returnOriginal: false });
//     if (user) {
//       return await transactionModel.create([{
//         status: "credited",
//         createdBy: "admin.dheeraj",
//         createdTo: userId,
//         battleId,
//         type: "winning prize",
//         orderId,
//         value: prize,
//         lastBalance: user.balance,
//         currentBalance: user.balance + prize,
//         position
//       }], { session });
//     }
//   } catch (error) {
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     await session.endSession();
//   }
// };

// export const distributePrizes_C = async (req: Request, res: Response) => {
//   // Validate battleId and other checks...

//   const winners = [
//     { position: 1, prize: battle.winning._1, userName: findUserNameOfWinner_1 },
//     { position: 2, prize: battle.winning._2, userName: findUserNameOfWinner_2 },
//     { position: 3, prize: battle.winning._3, userName: findUserNameOfWinner_3 }
//   ];

//   try {
//     const transactions = await Promise.all(winners.map(async winner => {
//       if (winner.userName) {
//         const order = await orderModel.findOne({ createBy: winner.userName, battle: battleId });
//         if (order) {
//           return handleTransaction(order.userId, winner.prize, winner.position, battleId, order._id);
//         }
//       }
//     }));

//     await battleModel.updateOne({ _id: battleId }, { status: "completed" });

//     return res.status(200).json({ success: true, data: { message: "Transactions Completed", transactions } });
//   } catch (error) {
//     return res.status(400).json({ success: false, error: error.message });
//   }
// };
