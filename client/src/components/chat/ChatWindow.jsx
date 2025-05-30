import { useState, useEffect, useRef } from "react";
import { chatAPI } from "../../api/chatAPI";
import { socketService } from "../../api/socketService";
import { useApp } from "../../context/AppContext";
import LoadingSpinner from "../LoadingSpinner";
import DefaultAvatar from "../common/DefaultAvatar";
import ReactDOM from "react-dom/client";
import "./ChatWindow.css";

export default function ChatWindow({ recipientId, onClose }) {
  const { user } = useApp();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [recipient, setRecipient] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const processedMessageIds = useRef(new Set());
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (!recipientId) {
      setError("No recipient specified");
      return;
    }

    // Reset state when recipient changes
    setMessages([]);
    setCurrentPage(1);
    setHasMore(false);
    processedMessageIds.current.clear();
    
    loadMessages();
    loadRecipientInfo();

    // Set up socket event listeners
    socketService.on("chat:message:new", handleNewMessage);
    socketService.on("chat:typing", handleTypingIndicator);

    // Clean up event listeners when component unmounts
    return () => {
      socketService.off("chat:message:new", handleNewMessage);
      socketService.off("chat:typing", handleTypingIndicator);
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [recipientId]);

  const handleScroll = async (e) => {
    const element = e.target;
    if (element.scrollTop === 0 && hasMore && !loadingMore) {
      await loadMoreMessages();
    }
  };

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await chatAPI.getMessageHistory(recipientId, {
        page: nextPage,
        limit: 50
      });

      const newMessages = response.data?.messages || [];
      const currentScrollHeight = messagesContainerRef.current?.scrollHeight || 0;

      // Add new messages to processed set
      newMessages.forEach(msg => {
        if (msg._id) {
          processedMessageIds.current.add(msg._id);
        }
      });

      setMessages(prev => [...newMessages, ...prev]);
      setCurrentPage(nextPage);
      setHasMore(response.data?.hasMore || false);

      // Maintain scroll position
      setTimeout(() => {
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          messagesContainerRef.current.scrollTop = newScrollHeight - currentScrollHeight;
        }
      }, 0);

    } catch (error) {
      console.error("Error loading more messages:", error);
      setError("Failed to load more messages");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNewMessage = (message) => {
    if (!message || !message.sender || !message.recipient || !message._id) return;
    
    // Check if we've already processed this message
    if (processedMessageIds.current.has(message._id)) {
      return;
    }
    
    // Only add the message if it's from the current conversation
    if (
      message.sender._id === recipientId ||
      message.recipient._id === recipientId
    ) {
      processedMessageIds.current.add(message._id);
      setMessages((prev) => [...prev, message]);
      scrollToBottom();

      // If we're receiving a message, mark it as read
      if (message.sender._id === recipientId) {
        markMessageAsRead(message._id);
      }
    }
  };

  const handleTypingIndicator = ({ userId, isTyping }) => {
    if (userId === recipientId) {
      // Handle typing indicator UI
      // Implementation depends on your UI design
    }
  };

  const loadRecipientInfo = async () => {
    if (!recipientId) return;
    
    try {
      const response = await chatAPI.getUserInfo(recipientId);
      setRecipient(response?.data || { username: "User" });
    } catch (error) {
      console.error("Error loading recipient info:", error);
      setRecipient({ username: "User" });
    }
  };

  const loadMessages = async () => {
    if (!recipientId) return;
    
    try {
      setLoading(true);
      const response = await chatAPI.getMessageHistory(recipientId, {
        page: 1,
        limit: 50
      });
      
      const messageList = response.data?.messages || [];
      
      // Add all loaded messages to processed set
      messageList.forEach(msg => {
        if (msg._id) {
          processedMessageIds.current.add(msg._id);
        }
      });
      
      setMessages(messageList);
      setHasMore(response.data?.hasMore || false);
      setCurrentPage(1);
      scrollToBottom();

      // Mark all received messages as read
      messageList.forEach((msg) => {
        if (msg?.sender?._id === recipientId && !msg.read) {
          markMessageAsRead(msg._id);
        }
      });
    } catch (error) {
      setError(error.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const markMessageAsRead = async (messageId) => {
    if (!messageId) return;
    
    try {
      await chatAPI.markAsRead(messageId);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !recipientId) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX

    try {
      setSending(true);
      const response = await chatAPI.sendMessage(recipientId, messageContent);
      if (response?.data?._id) {
        // Only add the message if we haven't processed it yet
        if (!processedMessageIds.current.has(response.data._id)) {
          processedMessageIds.current.add(response.data._id);
      setMessages((prev) => [...prev, response.data]);
      scrollToBottom();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
      setNewMessage(messageContent); // Restore the message content if sending failed
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!recipientId) return;

    // Send typing indicator
    socketService.emitTyping(recipientId, true);

    // Clear previous timeout
    if (typingTimeout) clearTimeout(typingTimeout);

    // Set new timeout
    const timeout = setTimeout(() => {
      socketService.emitTyping(recipientId, false);
    }, 2000);

    setTypingTimeout(timeout);
  };

  if (loading) {
    return (
      <div className="chat-window-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-window-error">
        <p className="chat-window-error-text">{error}</p>
        <button onClick={onClose} className="chat-window-error-close">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-window-header">
        <div className="chat-window-header-user">
          <div className="chat-window-avatar-container">
            {recipient?.photo_url ? (
              <img
                src={recipient.photo_url}
                alt={recipient?.username || "User"}
                className="chat-window-avatar"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const defaultAvatar = document.createElement('div');
                  defaultAvatar.className = 'default-avatar-wrapper';
                  e.target.parentElement.appendChild(defaultAvatar);
                  const root = ReactDOM.createRoot(defaultAvatar);
                  root.render(<DefaultAvatar size={56} className="chat-window-avatar" />);
                }}
              />
            ) : (
              <DefaultAvatar size={56} className="chat-window-avatar" />
            )}
            {recipient?.isOnline && (
              <span className="chat-window-online-indicator" />
            )}
          </div>
          <div>
            <h3 className="chat-window-username">{recipient?.username || "User"}</h3>
            <p className="chat-window-status">
              {recipient?.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="chat-window-close">
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div 
        className="chat-window-messages"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {loadingMore && (
          <div className="chat-window-loading-more">
            <LoadingSpinner size="small" />
          </div>
        )}
        {messages.map((message) => {
          if (!message?.sender?._id || !message?._id) return null;
          
          const isSender = message.sender._id === user?._id;
          const messageKey = `${message._id}-${message.sender._id}-${message.createdAt}`;
          
          return (
            <div
              key={messageKey}
              className={`chat-window-message ${
                isSender
                  ? "chat-window-message-sent"
                  : "chat-window-message-received"
              }`}
            >
              <div className="chat-window-message-content">
                <p>{message.content}</p>
                <span className="chat-window-message-time">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="chat-window-input-container">
        <form className="chat-window-input-form" onSubmit={handleSend}>
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="chat-window-input"
          />
          <button
            type="submit"
            className="chat-window-send-button"
            disabled={!newMessage.trim() || sending}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
        </div>
    </div>
  );
}
