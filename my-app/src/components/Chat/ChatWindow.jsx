// src/components/Chat/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage, getUserProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function ChatWindow({ selectedUserId }) {
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  // Ref for the message list div
  const messageListRef = useRef(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  // Fetch messages and user info
  useEffect(() => {
    setLoading(true);
    // Fetch message history and the other user's profile info
    Promise.all([
      getMessages(selectedUserId),
      getUserProfile(selectedUserId)
    ])
    .then(([messagesResponse, userResponse]) => {
      setMessages(messagesResponse.data);
      setOtherUser(userResponse.data);
    })
    .catch(err => {
      console.error("Error fetching chat data:", err);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [selectedUserId]);

  // Scroll to bottom when messages load
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      receiverId: selectedUserId,
      content: newMessage,
    };

    try {
      const response = await sendMessage(messageData);
      // Add new message to the state instantly
      setMessages(prevMessages => [...prevMessages, response.data]);
      setNewMessage(''); // Clear input
      // Scroll to new message
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) {
    return <div className="chat-window-placeholder"><h2>Loading chat...</h2></div>;
  }
  if (!otherUser) {
    return <div className="chat-window-placeholder"><h2>Error loading user.</h2></div>;
  }

  return (
    <section className="chat-window">
      <header className="chat-header">
        <Link to={`/profile/${otherUser.user_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {otherUser.name}
        </Link>
      </header>

      <div className="message-list" ref={messageListRef}>
        {messages.map(msg => (
          <div 
            key={msg.message_id}
            className={`message-bubble ${msg.sender_id === currentUser.userId ? 'sent' : 'received'}`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}

export default ChatWindow;