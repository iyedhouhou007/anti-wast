import User from "../models/User.js";
import Post from "../models/Post.js";
import AppError from "../utils/AppError.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.status(200).json({
      status: "success",
      message: "Profile retrieved successfully",
      data: { user },
    });
  } catch (error) {
    next(new AppError("Error fetching user profile", 500));
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const allowedFields = ["name", "email", "phone_number", "photo_url"];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.email && !validateEmail(updateData.email)) {
      return next(new AppError("Invalid email format", 400));
    }

    Object.keys(updateData).forEach((field) => {
      user[field] = updateData[field];
    });

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError("Email or username already in use", 400));
    }
    next(new AppError("Error updating user profile", 500));
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(
        new AppError("Current password and new password are required", 400)
      );
    }

    if (newPassword.length < 6) {
      return next(
        new AppError("New password must be at least 6 characters long", 400)
      );
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError("Current password is incorrect", 401));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    next(new AppError("Error changing password", 500));
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return next(new AppError("Password is required to delete account", 400));
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError("Password is incorrect", 401));
    }

    const userPosts = await Post.find({ user: req.user.id });
    const reservedPosts = userPosts.filter(
      (post) => post.reserved_by && post.reserved_by.toString() !== req.user.id
    );

    if (reservedPosts.length > 0) {
      return next(
        new AppError(
          "Cannot delete account with active reservations. Please cancel or complete these transactions first.",
          400
        )
      );
    }

    await Post.deleteMany({ user: req.user.id });
    await Post.updateMany(
      { reserved_by: req.user.id },
      { $set: { reserved_by: null } }
    );
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(new AppError("Error deleting account", 500));
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, "-password");

    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      data: {
        users,
      },
    });
  } catch (error) {
    next(new AppError("Error fetching users", 500));
  }
};

// Helper function to validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}
