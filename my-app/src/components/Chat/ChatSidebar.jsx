// src/components/Chat/ChatSidebar.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getConversations, getConnections } from '../../services/api';

function ChatSidebar({ onSelectConversation, selectedUserId }) {
  const [conversations, setConversations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    // Fetch both conversations and connections
    Promise.all([
      getConversations(),
      getConnections()
    ])
    .then(([convResponse, connResponse]) => {
      setConversations(convResponse.data);
      setConnections(connResponse.data);
    })
    .catch(err => {
      console.error("Error fetching chat sidebar data:", err);
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  // Filter connections to only show those *not* already in conversations
  const newConnections = useMemo(() => {
    const conversationUserIds = new Set(conversations.map(c => c.user_id));
    return connections.filter(conn => !conversationUserIds.has(conn.user_id));
  }, [conversations, connections]);

  // Filter lists based on search term
  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredNewConnections = newConnections.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderUserList = (users) => (
    <div className="user-list">
      {users.map(user => (
        <div 
          key={user.user_id} 
          className={`user-list-item ${selectedUserId === user.user_id ? 'active' : ''}`}
          onClick={() => onSelectConversation(user.user_id)}
        >
          {/* Placeholder for profile pic */}
          <div style={{ width: '40px', height: '40px', background: '#ccc', borderRadius: '50%' }} />
          <div>
            <div className="user-name">{user.name}</div>
            {user.last_message && (
              <div className="last-message">{user.last_message}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <aside className="chat-sidebar">
      <input 
        type="search"
        className="chat-search"
        placeholder="Search connections..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && <div>Loading...</div>}

      <h2>Conversations</h2>
      {filteredConversations.length > 0 ? 
        renderUserList(filteredConversations) : 
        !loading && <p style={{ padding: '0 10px' }}>No conversations yet.</p>}

      <h2>New Message</h2>
      {filteredNewConnections.length > 0 ? 
        renderUserList(filteredNewConnections) : 
        !loading && <p style={{ padding: '0 10px' }}>No new connections to message.</p>}
    </aside>
  );
}

export default ChatSidebar;