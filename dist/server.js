import { log } from "console";
import app from "./app.js";
import mongoose from "mongoose";
import "./env.config.js";
const port = process.env.PORT ?? 5000;
const DB_CONN_STR = process.env.ATLAS_CONN_STR || "mongodb://localhost:27017/edgeofesports";
mongoose.connect("mongodb+srv://skybird:dheeraj2024@mongodb-cluster.0cfhzxs.mongodb.net/edgeofesports?retryWrites=true&w=majority").then(() => {
    console.log("db connected successfully....");
});
app.listen(port, () => {
    log(`server started on http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map