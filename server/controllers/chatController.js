import chatService from "../services/chatService.js";
import AppError from "../utils/AppError.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    const message = await chatService.sendMessage(
      senderId,
      recipientId,
      content
    );

    res.status(201).json({
      status: "success",
      message: "Message sent successfully",
      data: { message },
    });
  } catch (error) {
    next(new AppError("Error sending message", 500));
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await chatService.getMessages(userId, otherUserId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      beforeTimestamp: req.query.before,
      afterTimestamp: req.query.after,
    });

    res.status(200).json({
      status: "success",
      message: "Messages retrieved successfully",
      data: { messages },
    });
  } catch (error) {
    next(new AppError("Error fetching messages", 500));
  }
};

export const markMessageAsRead = async (req, res, next) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.id;

    const message = await chatService.markAsRead(messageId, userId);

    res.status(200).json({
      status: "success",
      message: "Message marked as read",
      data: { message },
    });
  } catch (error) {
    next(new AppError("Error marking message as read", 500));
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const count = await chatService.getUnreadCount(userId);

    res.status(200).json({
      status: "success",
      message: "Unread count retrieved successfully",
      data: { count },
    });
  } catch (error) {
    next(new AppError("Error getting unread count", 500));
  }
};

export const getPreviousChatUsers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log("User ID:", userId);
    const users = await chatService.getPreviousChatUsers(userId);

    console.log("Previous chat users:", users);

    res.status(200).json({
      status: "success",
      message: "Previous chat users retrieved successfully",
      data: { users },
    });
  } catch (error) {
    next(new AppError("Error getting previous chat users", 500));
  }
};
