import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import { User } from "../models/User.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
import { Stats } from "../models/Stats.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  const file = req.file;

  if (!name || !email || !password || !file) {
    return next(new ErrorHandler("Please add all fields", 400));
  }

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("User already exist", 409));
  }
  const fileUri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  user = await User.create({
    name,
    email,
    password,
    avatar: { public_id: myCloud.public_id, url: myCloud.secure_url },
  });

  sendToken(res, user, "Registered SuccessFully", 201);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please add all fields", 400));
  }
  // const file = req.file;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Incorrect Email or Password", 401));
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler("Incorrect Email or Password", 401));
  }

  sendToken(res, user, `Welcome back ${user.name}`, 200);
});

export const logout = catchAsyncError(async (req, res, next) => {
  

  res.status(200).cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true, // This ensures the cookie is only accessible by the web server
    sameSite: "None", // Ensure this matches your front-end and back-end setup, especially if using cross-site requests
    secure: true, // Make sure this is true only in production
    path: '/',
  }).json({
    success: true,
    message: "logout successfully",
  });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User Not found", 401));

  res.status(200).json({
    success: true,
    user,
  });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Please add all fields", 400));
  }

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) {
    return next(new ErrorHandler("Incorrect old Password", 401));
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (name) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated successfully",
  });
});

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const file = req.file;

  const fileUri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Picture Updated successfully",
  });
});

export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User not found", 404));

  const resetToken = await user.getResetToken();

  await user.save();

  // http://localhost:3000/resetpassword/asdasdasdds

  const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  const message = `Click on the link to reset your password. ${url}. If you have not requested then please ignore`;

  await sendEmail(user.email, "CourseBundler Reset Password", message);

  res.status(200).json({
    success: true,
    message: `Reset Token has been sent to ${user.email}`,
  });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = await crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPassowrdExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("token is invalid or has been expired", 401));

  user.password = req.body.password;

  user.resetPassowrdExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const addToPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.body.id);

  if (!course) return next(new ErrorHandler("Invalid course id", 404));

  const itemExist = user.playlist.find((item) => {
    if (item.course._id.toString() === course._id.toString()) return true;
  });

  if (itemExist)
    return next(new ErrorHandler("Course already exist in playlist", 400));

  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Added to playlist",
  });
});

export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.query.id);

  if (!course) return next(new ErrorHandler("Invalid course id", 404));

  const newPlaylist = user.playlist.filter((item) => {
    if (item.course._id.toString() !== course._id.toString()) return item;
  });

  user.playlist = newPlaylist;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Removed from playlist",
  });
});

//admin controllers

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    success: true,
    users,
  });
});

export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user.role === "user") user.role = "admin";
  else user.role = "user";

  await user.save();

  res.status(200).json({
    success: true,
    message: "role updated succesfully",
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User not found", 404));

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  //cancel subscription

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted succesfully",
  });
});

export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  //cancel subscription

  await user.deleteOne();

  const options = {
    expires: new Date(Date.now()),
    httpOnly: true, // This ensures the cookie is only accessible by the web server
    sameSite: 'None', // Ensure this matches your front-end and back-end setup, especially if using cross-site requests
    secure: true // Make sure this is true only in production
  };

  res.status(200).cookie("token", null, options).json({
    success: true,
    message: "User deleted successfully",
  });
});

User.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

  const subscription = await User.find({ "subsription.status": "active" });

  stats[0].users = await User.countDocuments();
  stats[0].subscriptions = subscription.length;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
