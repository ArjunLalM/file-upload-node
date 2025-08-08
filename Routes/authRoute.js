import express from "express";
import { login, userSignUp } from "../Controller/authController.js";
import { check } from "express-validator";

const router = express.Router();

// ✅ User Signup Route
router.post(
  "/signup",
  [
    check("firstName").not().isEmpty().withMessage("First name is required"),
    check("lastName").not().isEmpty().withMessage("Last name is required"),
    check("dateOfBirth").not().isEmpty().withMessage("Date of birth is required"),
    check("phoneNumber").not().isEmpty().withMessage("Phone number is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("gender").not().isEmpty().withMessage("Gender is required"),
    check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    check("passwordConfirm").not().isEmpty().withMessage("Password confirmation is required"),
  ],
  userSignUp
);

// ✅ User Login Route
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").not().isEmpty().withMessage("Password is required"),
  ],
  login
);

export default router;
