import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import HttpError from "../middlewares/httpError.js";

// ✅ User Signup
export const userSignUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("Validation error:", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed, Please check your data before retry!",
          422
        )
      );
    }

    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      password,
      passwordConfirm,
    } = req.body;

    // Check for duplicate email or phone
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(401).json({
        status: "error",
        message: "Email already exists",
      });
    }

    const existingPhoneUser = await User.findOne({ phoneNumber });
    if (existingPhoneUser) {
      return res.status(401).json({
        status: "error",
        message: "Phone number already exists",
      });
    }

    // Check if passwords match
    if (password !== passwordConfirm) {
      return next(new HttpError("Passwords do not match!", 400));
    }

    // Hash the password
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await User.create({
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser._id, role: "user" },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.status(201).json({
      status: true,
      message: "User registered successfully...!",
      data: newUser,
      access_token: token,
      userId: newUser._id,
      role: "user",
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Oops! Signup failed, please contact admin", 500)
    );
  }
};

// ✅ User Login
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        new HttpError(
          "Invalid data inputs passed, Please check your data before retry!",
          422
        )
      );
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found with this email",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: "user" },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    return res.status(200).json({
      status: true,
      message: "User logged in successfully...!",
      data: user,
      access_token: token,
      userId: user._id,
      role: "user",
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Oops! Login failed, please contact admin", 500)
    );
  }
};
