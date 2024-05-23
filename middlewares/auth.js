import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  console.log(req)
 console.log(token)
  if (!token) return next(new ErrorHandler("Not logged In", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData._id);

  next();
});

export const authorizeAdmin = catchAsyncError((req, res, next) => {
  if (req.user.role !== "admin")
    return next(
      new ErrorHandler(
        `${req.user.role} is not allowed to access this role`,
        403
      )
    );

  next();
});

export const authorizeSubscriber = catchAsyncError((req, res, next) => {
  if (req.user.subsription.status !== "active" && req.user.role !== "admin")
    return next(
      new ErrorHandler(
        `Only subscriber can access this resource`,
        403
      )
    );

  next();
});
