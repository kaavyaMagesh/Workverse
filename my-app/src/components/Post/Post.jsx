// src/components/Post/Post.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHashtagsForPost } from '../../services/api';
import CommentSection from './CommentSection.jsx';

function Post({ post }) {
  const [hashtags, setHashtags] = useState([]);
  const [showComments, setShowComments] = useState(false);

  // When the component loads, fetch its own hashtags
  useEffect(() => {
    if (post.post_id) {
        getHashtagsForPost(post.post_id)
        .then(response => {
          setHashtags(response.data);
        })
        .catch(err => {
          console.error(`Error fetching hashtags for post ${post.post_id}:`, err);
        });
    }
  }, [post.post_id]); // Re-run if the post ID changes

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
      </div>
      <div className="post-footer">
        <div className="post-hashtags">
          {hashtags.map((tag, index) => (
            <span key={index} className="post-hashtag">
              #{tag.hashtag}
            </span>
          ))}
        </div>
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