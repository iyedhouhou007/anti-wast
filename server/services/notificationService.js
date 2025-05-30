import Notification from "../models/Notification.js";
import socketService from "./socketService.js";
import User from "../models/User.js";

class NotificationService {
  async createNotification(recipientId, type, message, relatedPost = null) {
    try {
      // 1. Save the notification to the database
      const notification = await Notification.create({
        recipient: recipientId,
        type,
        message,
        relatedPost,
      }); // 2. Populate any related data needed for the real-time payload // We populate AFTER creation to ensure the doc exists

      await notification.populate("relatedPost"); // 3. Emit the new notification to the recipient in real-time // The client-side should listen for 'notification:new'

      socketService.emitToUser(recipientId, "notification:new", notification);
      console.log(`Notification created and emitted to user ${recipientId}`);

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error; // Re-throw to be handled by the caller (e.g., API endpoint)
    }
  }

  async getUnreadNotifications(userId) {
    try {
      // Fetch unread notifications from the database
      return await Notification.find({
        recipient: userId,
        read: false,
      })
        .populate("relatedPost") // Populate related data
        .sort("-createdAt"); // Get latest first
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      throw error;
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      // Find and update the specific notification, ensuring it belongs to the user
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId, read: false }, // Only update if unread
        { read: true },
        { new: true } // Return the updated document
      );

      // If notification was found and updated (was previously unread)
      if (notification) {
        console.log(
          `Notification ${notificationId} marked as read for user ${userId}`
        );
        // Emit a real-time event to the user so their UI can update
        // Client-side should listen for 'notification:read'
        socketService.emitToUser(userId, "notification:read", {
          notificationId: notification._id,
          userId: userId,
          // You could emit the full updated notification object if needed: notification
        });
      } else {
        console.log(
          `Notification ${notificationId} not found or already read for user ${userId}`
        );
      }

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      // Find all unread notifications for the user and mark them as read
      const result = await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true }
      );

      // Check if any notifications were actually modified
      if (result.modifiedCount > 0) {
        console.log(
          `All notifications marked as read for user ${userId}. Count: ${result.modifiedCount}`
        );
        // Emit a real-time event to the user so their UI can update
        // Client-side should listen for 'notification:allRead'
        socketService.emitToUser(userId, "notification:allRead", {
          userId: userId,
          count: result.modifiedCount, // Optionally send the count of updated notifications
        });
      } else {
        console.log(
          `No unread notifications found for user ${userId} to mark as read.`
        );
      }

      return true; // Indicate success (even if no docs were modified)
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      return await User.find({}, "-password");
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }
}

export default new NotificationService();
