import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js"; // Import AppError

const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return next(new AppError("No token provided", 401)); // Use AppError
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return next(new AppError("Invalid token", 401)); // Use AppError
    }
};

export default protect; // Changed module.exports to export default