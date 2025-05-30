import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { chatAPI } from "../../api/chatAPI";
import { socketService } from "../../api/socketService";
import { formatDistanceToNow } from "date-fns";
import { uploadAPI } from "../../api/uploadAPI";
import LoadingSpinner from "../LoadingSpinner";
import DefaultAvatar from "../common/DefaultAvatar";
import "./ChatList.css";
import ReactDOM from "react-dom/client";

const ChatList = ({ selectedChat, onSelectChat }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();

    // Listen for new messages to update conversation list
    socketService.on("chat:message:new", handleNewMessage);
    socketService.on("chat:message:read", handleMessageRead);

    return () => {
      socketService.off("chat:message:new", handleNewMessage);
      socketService.off("chat:message:read", handleMessageRead);
    };
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.getConversations();

      // Get conversations directly from the response
      const conversationList = response?.data?.conversations || [];

      setConversations(sortConversationsByDate(conversationList));
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setError("Failed to load conversations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    if (!message || !message.sender || !message.recipient) return;

    setConversations((prev) => {
      // Find if conversation exists
      const conversationIndex = prev.findIndex((conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p._id !== user?._id
        );
        return (
          otherParticipant &&
          (message.sender._id === otherParticipant._id ||
            message.recipient._id === otherParticipant._id)
        );
      });

      let updatedConversations = [...prev];

      if (conversationIndex !== -1) {
        // Update existing conversation
        const conversation = { ...updatedConversations[conversationIndex] };
        conversation.lastMessage = message;
        conversation.updatedAt = message.createdAt;

        if (message.sender._id !== user?._id) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        updatedConversations[conversationIndex] = conversation;
      } else {
        // Create new conversation
        const otherUser =
          message.sender._id === user?._id ? message.recipient : message.sender;
        const newConversation = {
          _id: `chat_${otherUser._id}`,
          participants: [user, otherUser],
          lastMessage: message,
          updatedAt: message.createdAt,
          unreadCount: message.sender._id !== user?._id ? 1 : 0,
        };
        updatedConversations = [newConversation, ...updatedConversations];
      }

      return sortConversationsByDate(updatedConversations);
    });
  };

  const handleMessageRead = ({ messageId, readBy }) => {
    if (!messageId || !readBy) return;

    setConversations((prev) => {
      return prev.map((conv) => {
        if (conv.lastMessage?._id === messageId && readBy === user?._id) {
          return {
            ...conv,
            unreadCount: 0,
          };
        }
        return conv;
      });
    });
  };

  const sortConversationsByDate = (conversations) => {
    return [...conversations].sort((a, b) => {
      const dateA = new Date(a?.updatedAt || a?.lastMessage?.createdAt || 0);
      const dateB = new Date(b?.updatedAt || b?.lastMessage?.createdAt || 0);
      return dateB - dateA;
    });
  };

  const handleChatSelect = (conversation) => {
    if (!conversation || !user) return;

    const otherUser = conversation.participants?.find(
      (p) => p._id !== user._id
    );
    if (!otherUser) return;

    if (onSelectChat) {
      onSelectChat(conversation);
    }

    // Navigate to the chat with the other user
    navigate(`/messages/${otherUser._id}`);
  };

  const getAvatarUrl = (otherUser) => {
    if (!otherUser) return null;
    return uploadAPI.getAvatarUrl(otherUser) || otherUser.photo_url || null;
  };

  if (loading) {
    return (
      <div className="chat-list-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-list-error">
        <p>{error}</p>
        <button onClick={fetchConversations} className="chat-list-retry">
          Retry
        </button>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="chat-list-empty">
        <p>No conversations yet</p>
        <p className="chat-list-empty-subtitle">
          Start a conversation from a bread post
        </p>
      </div>
    );
  }

  return (
    <div className="chat-list">
      {conversations.map((conversation) => {
        if (!conversation || !conversation.participants) return null;

        const otherUser = conversation.participants.find(
          (p) => p._id !== user?._id
        );

        if (!otherUser) return null;

        const lastMessage = conversation.lastMessage;
        const lastMessageTime = lastMessage?.createdAt
          ? formatDistanceToNow(new Date(lastMessage.createdAt), {
              addSuffix: true,
            })
          : "";

        const avatarUrl = getAvatarUrl(otherUser);

        return (
          <div
            key={conversation._id}
            className={`chat-list-item ${
              selectedChat?._id === conversation._id
                ? "chat-list-item-selected"
                : ""
            }`}
            onClick={() => handleChatSelect(conversation)}
          >
            <div className="chat-list-avatar-container">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={otherUser.username || "User"}
                  className="chat-list-avatar-image"
                  onError={(e) => {
                    e.target.style.display = "none";
                    const defaultAvatar = document.createElement("div");
                    defaultAvatar.className = "default-avatar-wrapper";
                    e.target.parentElement.appendChild(defaultAvatar);
                    const root = ReactDOM.createRoot(defaultAvatar);
                    root.render(
                      <DefaultAvatar
                        size={56}
                        className="chat-list-avatar-image"
                      />
                    );
                  }}
                />
              ) : (
                <DefaultAvatar size={56} className="chat-list-avatar-image" />
              )}
              {otherUser.isOnline && (
                <span className="chat-list-online-indicator" />
              )}
            </div>
            <div className="chat-list-details">
              <div className="chat-list-header">
                <span className="chat-list-username">
                  {otherUser.username || "Unknown user"}
                </span>
                <span className="chat-list-date">{lastMessageTime}</span>
              </div>
              <div className="chat-list-message">
                <span className="chat-list-message-text">
                  {lastMessage?.content || "No messages yet"}
                </span>
                {conversation.unreadCount > 0 && (
                  <span className="chat-list-unread">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
