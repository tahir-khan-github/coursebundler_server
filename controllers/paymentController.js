import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { instance } from "../server.js";
import crypto from "crypto";
import { Payment } from "../models/Payment.js";

export const buySubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.role === "admin")
    return next(new ErrorHandler("Admin can't buy subscription", 400));

  const plan_id = process.env.PLAN_ID || "plan_OAEqGOEdUM4m3Q";

  const subscription = await instance.subscriptions.create({
    plan_id: plan_id,
    customer_notify: 1,
    total_count: 12,
  });

  user.subsription.id = subscription.id;
  user.subsription.status = subscription.status;

  await user.save();

  res.status(200).json({
    success: true,
    subscriptionId: subscription.id,
  });
});

export const paymentVerification = catchAsyncError(async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  const user = await User.findById(req.user._id);

  const subscription_id = user.subsription.id;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
    .digest("hex");

  const isAuthentic = razorpay_signature === generated_signature;

  if (!isAuthentic)
    return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);

  await Payment.create({
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  });

  user.subsription.status = "active";

  await user.save();

  res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`)
});

export const getRazorpayKey = catchAsyncError(async (req,res,next)=>{
    res.status(200).json({
        success: true,
        key: process.env.RAZORPAY_KEY
    })
});


export const cancelSubscription = catchAsyncError(async (req,res,next)=>{
    const user = await User.findById(req.user._id);

    const subscriptionId = user.subsription.id;
  
    let refund = false;
  
    await instance.subscriptions.cancel(subscriptionId);
  
    const payment = await Payment.findOne({
      razorpay_order_id: subscriptionId,
    })
  
    const gap = Date.now() - payment.createdAt;
  
    const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;
  
    if(refundTime > gap){
      await instance.payments.refund(payment.razorpay_payment_id);
      refund = true
    }

    await payment.deleteOne();

    user.subsription.id = undefined;
    user.subsription.status = undefined;

    await user.save()
      
      res.status(200).json({
          success: true,
          message: refund ? "Subscription cancelled, You will receive full refund within 7 days." : "Subscription cancelled, No refund initiated as subscription was cancelled after 7 days"
      })
})
