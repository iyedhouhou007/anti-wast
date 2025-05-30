import Message from "../models/Message.js";
import User from "../models/User.js";
import socketService from "./socketService.js";
import notificationService from "./notificationService.js";
import mongoose from "mongoose";

class ChatService {
  async sendMessage(senderId, recipientId, content) {
    try {
      if (!content?.trim()) {
        throw new Error("Message content cannot be empty");
      }
      if (!recipientId) {
        throw new Error("Recipient ID must be provided.");
      }

      const message = await Message.create({
        sender: senderId,
        recipient: recipientId,
        content: content.trim(),
        readBy: [senderId], // Mark as read by sender
      });

      await message.populate([
        { path: "sender", select: "username photo_url" },
        { path: "recipient", select: "username photo_url" },
      ]);

      const messagePayload = this._formatMessagePayload(message);
      this._emitDirectMessage(senderId, recipientId, messagePayload);

      // Create a notification for the recipient
      await notificationService.createNotification(
        recipientId,
        "SYSTEM",
        `New message from ${message.sender.username}: ${content.substring(
          0,
          50
        )}${content.length > 50 ? "..." : ""}`
      );

      return message;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async getMessages(userId, otherUserId, options = {}) {
    try {
      const { limit = 50, skip = 0, beforeTimestamp, afterTimestamp } = options;

      let query = {
        $or: [
          { sender: userId, recipient: otherUserId },
          { sender: otherUserId, recipient: userId },
        ],
      };

      // Add timestamp filters if provided
      if (beforeTimestamp || afterTimestamp) {
        query.createdAt = {};
        if (beforeTimestamp) query.createdAt.$lt = new Date(beforeTimestamp);
        if (afterTimestamp) query.createdAt.$gt = new Date(afterTimestamp);
      }

      const messages = await Message.find(query)
        .populate("sender", "username photo_url")
        .populate("recipient", "username photo_url")
        .sort("createdAt") // Changed from -createdAt to createdAt to show oldest first
        .limit(limit)
        .skip(skip);

      return messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  async markAsRead(messageId, userId) {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: userId } },
        { new: true }
      ).populate("sender recipient");

      if (!message) {
        throw new Error("Message not found");
      }

      // Notify sender about read status
      const readPayload = {
        messageId: message._id,
        userId,
      };

      socketService.emitToUser(
        message.sender._id,
        "chat:message:read",
        readPayload
      );

      return message;
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      return await Message.countDocuments({
        recipient: userId,
        readBy: { $ne: userId },
      });
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  }

  /**
   * Get users that the current user has previously chatted with, including the last message and unread count.
   * This function uses Mongoose aggregation to efficiently query and process the data.
   * It assumes the existence of Mongoose models 'Message' and 'User' with the schemas provided previously.
   *
   * @param {String} userId - The ID of the current user as a string.
   * @returns {Promise<Array>} - A promise that resolves to an array of user objects with recent message information.
   * Each object includes _id, username, name, photo_url, lastMessage (content, createdAt, isFromUser), and unreadCount.
   */
  async getPreviousChatUsers(userId) {
    try {
      // Convert the string userId to a Mongoose ObjectId for use in queries.
      const objectUserId = new mongoose.Types.ObjectId(userId);

      // Use the Message model's aggregate function to perform a multi-stage data processing pipeline.
      // Assumes 'Message' model is defined and imported.
      const conversations = await Message.aggregate([
        {
          // Stage 1: Filter messages to include only those where the current user is either the sender or the recipient.
          $match: {
            $or: [{ sender: objectUserId }, { recipient: objectUserId }],
          },
        },
        {
          // Stage 2: Sort the matched messages by creation date in ascending order.
          // This is crucial for the $last operator in the next stage to correctly identify the most recent message.
          $sort: { createdAt: 1 },
        },
        {
          // Stage 3: Group messages by the other participant in the conversation.
          // The _id of the group will be the ObjectId of the other user.
          $group: {
            _id: {
              // Use a conditional expression to determine the other participant's ID.
              // If the sender is the current user, the recipient is the other user, otherwise the sender is the other user.
              $cond: [
                { $eq: ["$sender", objectUserId] }, // Condition: Is the sender the current user?
                "$recipient", // If true, group by the recipient.
                "$sender", // If false, group by the sender.
              ],
            },
            // Accumulator: Get the last message document in the group (which is the most recent due to the previous sort).
            lastMessage: { $last: "$$ROOT" },
            // Accumulator: Calculate the unread count for messages received by the current user in this conversation.
            unreadCount: {
              $sum: {
                // Conditional sum: Add 1 if the message was sent to the current user AND the current user's ID is NOT in the readBy array.
                $cond: [
                  {
                    $and: [
                      { $eq: ["$recipient", objectUserId] }, // Condition 1: Message was sent to the current user.
                      { $not: [{ $in: [objectUserId, "$readBy"] }] }, // Condition 2: Current user's ID is not in the readBy array.
                    ],
                  },
                  1, // If both conditions are true, add 1 to the sum.
                  0, // Otherwise, add 0.
                ],
              },
            },
            // Accumulator: Get the maximum creation date within the group (which is the timestamp of the last message).
            lastMessageDate: { $max: "$createdAt" },
          },
        },
        {
          // Stage 4: Sort the grouped conversations by the last message date in descending order.
          // This orders the conversations from most recent activity to oldest.
          $sort: { lastMessageDate: -1 },
        },
        {
          // Stage 5: Perform a left outer join with the 'users' collection.
          // We join the _id field of the grouped conversation (which is the other user's ID)
          // with the _id field of the users collection.
          // The matching user document will be added as an array named 'userInfo' to each conversation document.
          // Assumes 'User' model corresponds to the 'users' collection.
          $lookup: {
            from: "users", // The collection to join with. Mongoose automatically pluralizes model names to find the collection.
            localField: "_id", // Field from the input documents (the grouped conversation documents).
            foreignField: "_id", // Field from the documents of the "users" collection.
            as: "userInfo", // The name of the new array field to add to the input documents.
          },
        },
        {
          // Stage 6: Deconstruct the 'userInfo' array field from the input documents to output a new document for each element.
          // Since we expect exactly one user match per conversation _id, this effectively flattens the 'userInfo' array.
          $unwind: "$userInfo",
        },
      ]);

      // Map the results from the aggregation pipeline into a more convenient format.
      const chatUsers = conversations.map((conv) => ({
        _id: conv.userInfo._id, // The ID of the other user.
        username: conv.userInfo.username, // The username of the other user.
        name: conv.userInfo.name, // The name of the other user.
        photo_url: conv.userInfo.photo_url, // The photo URL of the other user.
        lastMessage: {
          content: conv.lastMessage.content, // The content of the last message.
          createdAt: conv.lastMessage.createdAt, // The creation date of the last message.
          // Determine if the last message was sent by the current user.
          isFromUser:
            conv.lastMessage.sender.toString() === objectUserId.toString(),
        },
        unreadCount: conv.unreadCount, // The calculated unread count for this conversation.
      }));

      // Return the formatted array of chat users.
      return chatUsers;
    } catch (error) {
      // Log any errors that occur during the process and re-throw the error.
      console.error("Error getting previous chat users:", error);
      throw error;
    }
  }

  // Private helper methods
  _formatMessagePayload(message) {
    return {
      _id: message._id,
      sender: {
        _id: message.sender._id,
        username: message.sender.username,
        photo_url: message.sender.photo_url,
      },
      recipient: {
        _id: message.recipient._id,
        username: message.recipient.username,
        photo_url: message.recipient.photo_url,
      },
      content: message.content,
      readBy: message.readBy,
      createdAt: message.createdAt,
    };
  }

  _emitDirectMessage(senderId, recipientId, messagePayload) {
    socketService.emitToUser(recipientId, "chat:message:new", messagePayload);
    if (senderId !== recipientId) {
      socketService.emitToUser(senderId, "chat:message:new", messagePayload);
    }
  }
}

export default new ChatService();
