import Razorpay from "razorpay";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import cloudinary from "cloudinary";
import nodeCron from "node-cron";
import { Stats } from "./models/Stats.js";

connectDB();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

 const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

export default instance;

nodeCron.schedule("0 0 0 1 * *", async () => {
  try {
    await Stats.create({});
  } catch (error) {
    console.log(error);
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server is working on port: ", process.env.PORT);
});



