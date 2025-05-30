import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";

export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError("Validation failed", 400, "fail", { errors: errors.array() })
    );
  }

  const { username, email, password, phone_number, photo_url } = req.body;

  try {
    const existingUsername = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    const errorMessages = [];
    if (existingUsername) {
      errorMessages.push("Username already exists.");
    }
    if (existingEmail) {
      errorMessages.push("Email already exists.");
    }

    if (errorMessages.length > 0) {
      return next(new AppError(errorMessages.join(" and "), 409));
    }

    const user = await User.create({
      username,
      email,
      password,
      phone_number,
      photo_url,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: { token, user },
    });
  } catch (err) {
    next(new AppError("Error creating user", 500));
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new AppError("Invalid credentials", 400));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.password = undefined;
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: { token, user },
    });
  } catch (error) {
    next(new AppError("Error logging in", 500));
  }
};

export const logoutUser = (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
};
