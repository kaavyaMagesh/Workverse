// src/components/Post/Post.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHashtagsForPost } from '../../services/api';
import CommentSection from './CommentSection.jsx';

function Post({ post }) {
  const [hashtags, setHashtags] = useState([]);
  const [showComments, setShowComments] = useState(false);

  // ... (existing useEffect for fetching hashtags)

  return (
    <div className="post-container">
      <div className="post-header">
        <Link to={`/profile/${post.user_id}`} className="post-author-link">
          <span className="post-author">{post.name}</span>
        </Link>
        <span className="post-time">
          {new Date(post.content_sent_at).toLocaleString()}
        </span>
      </div>
      <div className="post-content">
        <p>{post.content}</p>

        {/* 🌟 NEW: Display Image if image_url exists 🌟 */}
        {post.image_url && (
            <div className="post-image-wrapper">
                {/* The source must be the full path to the server's static folder */}
                <img 
                    src={`http://localhost:3001/${post.image_url}`} 
                    alt="Post media" 
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginTop: '10px' }}
                />
            </div>
        )}
        {/* ------------------------------------------- */}

      </div>
      <div className="post-footer">
        {/* ... (rest of the footer) */}
        
        <button 
          className="comment-button"
          onClick={() => setShowComments(!showComments)}
        >
          {showComments ? 'Hide Comments' : 'Comment'}
        </button>
      </div>
      
      {/* Conditionally render the comment section */}
      {showComments && <CommentSection postId={post.post_id} />}
    </div>
  );
}

export default Post;