import jwt from "jsonwebtoken";
import HttpError from "../middlewares/httpError.js";
import User from "../Models/User.js";

const authCheck = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new HttpError("Authorization Failed!", 403));
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const validUser = await User.findById(decodedToken.userId);

    if (!validUser) {
      return next(new HttpError("Invalid User Credentials!", 400));
    }

    req.userData = { userId: decodedToken.userId, role: decodedToken.role };
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return next(new HttpError("Authentication failed", 403));
  }
};

export default authCheck;
