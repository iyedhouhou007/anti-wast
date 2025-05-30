import notificationService from "../services/notificationService.js";
import AppError from "../utils/AppError.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUnreadNotifications(
      req.user.id
    );
    res.status(200).json({
      status: "success",
      message: "Notifications retrieved successfully",
      data: { notifications },
    });
  } catch (error) {
    next(new AppError("Error fetching notifications", 500));
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );
    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }
    res.status(200).json({
      status: "success",
      message: "Notification marked as read",
      data: { notification },
    });
  } catch (error) {
    next(new AppError("Error marking notification as read", 500));
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({
      status: "success",
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(new AppError("Error marking notifications as read", 500));
  }
};
