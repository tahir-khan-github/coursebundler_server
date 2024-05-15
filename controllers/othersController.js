import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { Stats } from "../models/Stats.js";
import { sendEmail } from "../utils/sendEmail.js";

export const contact = catchAsyncError(async (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return next(new ErrorHandler("All fields are required", 400));

  const to = process.env.MY_EMAIL;
  const subject = "Contact from CourseBundler";
  const text = `I am ${name} and my email is ${email}. \n${message}`;

  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "Your Message has been sent",
  });
});

export const courseRequest = catchAsyncError(async (req, res, next) => {
  const { name, email, course } = req.body;

  if (!name || !email || !course)
    return next(new ErrorHandler("All fields are required", 400));

  const to = process.env.MY_EMAIL;
  const subject = "Request for a course on CourseBundler";
  const text = `I am ${name} and my email is ${email}. \n${course}`;

  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "Your request has been sent",
  });
});

export const getDashboardStats = catchAsyncError(async (req, res, next) => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);

  const statsData = [];

  for (let i = 0; i < stats.length; i++) {
    statsData.unshift(stats[i]);
  }

  const requiredSize = 12 - stats.length;

  for (let i = 0; i < requiredSize; i++) {
    statsData.unshift({
      users:0,
      subscriptions:0,
      views:0
    });
    
  }


  const usersCount = statsData[11].users;
  const subscriptionsCount = statsData[11].subscriptions;
  const viewsCount = statsData[11].views;

  let usersProfit = true, subscriptionsProfit = true, viewsProfit = true
  let usersPercent = 0 , subscriptionsPercent = 0 ,viewsPercent = 0

  if(statsData[10].users === 0) usersPercent = usersCount * 100;
  if(statsData[10].subscriptions === 0) subscriptionsPercent = subscriptionsCount * 100;
  if(statsData[10].views === 0) viewsPercent = viewsCount * 100;
  else{
    const difference = {
      users: statsData[11].users - statsData[10].users,
      users: statsData[11].subscriptions - statsData[10].subscriptions,
      users: statsData[11].views - statsData[10].views,
    }

    usersPercent = (difference.users/statsData[10].users) * 100;
    subscriptionsPercent = (difference.subscriptions/statsData[10].subscriptions) * 100;
    viewsPercent = (difference.views/statsData[10].views) * 100;

    if(usersPercent < 0) usersProfit = false;
    if(subscriptionsPercent < 0) subscriptionsProfit = false;
    if(viewsPercent < 0) viewsProfit = false;
  }


  res.status(200).json({
    success: true,
    stats: statsData,
    usersCount,
    subscriptionsCount,
    viewsCount,
    usersPercent,
    subscriptionsPercent,
    viewsPercent,
    usersProfit,
    subscriptionsProfit,
    viewsProfit
  });
});
