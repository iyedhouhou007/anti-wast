import { useState, useEffect } from "react";
import { useParams, useSearchParams, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { userAPI } from "../api/userAPI";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import "./MessagesPage.css";

export default function MessagesPage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const queryUserId = searchParams.get('userId');
  const { user } = useApp();
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeChat = async () => {
      const targetUserId = userId || queryUserId;
      if (!targetUserId) return;

      try {
        setLoading(true);
        setError(null);
        // Fetch the user details first
        const userData = await userAPI.getUserById(targetUserId);
        if (userData) {
          setChatUser(userData);
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError(err.message || "Failed to load user information");
      } finally {
        setLoading(false);
    }
    };

    initializeChat();
  }, [userId, queryUserId]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    // Find the other user in the conversation
    const otherUser = chat.participants.find((p) => p._id !== user._id);
    if (otherUser) {
      setChatUser(otherUser);
    }
  };

  if (loading) {
    return (
      <div className="messages-page">
        <h1 className="page-title">Messages</h1>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="messages-page">
        <h1 className="page-title">Messages</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <h1 className="page-title">
        <span>Messages</span>
      </h1>

      <div className="messages-container">
        {/* Chat list sidebar */}
        <div className="messages-sidebar">
          <ChatList
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
          />
        </div>

        {/* Chat window or empty state */}
        <div className="messages-main">
          {chatUser ? (
            <ChatWindow
              recipientId={chatUser._id}
              onClose={() => {
                setChatUser(null);
                setSelectedChat(null);
              }}
            />
          ) : (
            <div className="messages-empty-state">
              <div className="messages-empty-icon">💬</div>
              <h2 className="messages-empty-title">Your Messages</h2>
              <p className="messages-empty-text">
                Select a conversation from the list or start a new one from a bread post.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
