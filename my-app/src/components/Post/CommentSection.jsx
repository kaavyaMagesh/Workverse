// src/components/Post/CommentSection.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCommentsForPost, addCommentToPost } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth(); // Get current user for their name

  // Fetch comments
  const fetchComments = () => {
    getCommentsForPost(postId)
      .then(response => {
        setComments(response.data);
      })
      .catch(err => {
        console.error("Error fetching comments:", err);
        setError("Could not load comments.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Load comments when component mounts
  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Handle new comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentData = {
      comment_content: newComment,
      // No commenter_id needed! Server gets it from token.
    };

    try {
      await addCommentToPost(postId, commentData);
      setNewComment(''); // Clear input
      // Refresh comments
      // For instant feedback, we can add the comment manually
      // Or just refetch all comments
      fetchComments(); 
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to post comment.");
    }
  };

  return (
    <div className="comment-section">
      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button type="submit">Post</button>
      </form>

      {loading && <div>Loading comments...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div className="comment-list">
        {comments.map(comment => (
          <div key={comment.comment_id} className="comment">
            <Link to={`/profile/${comment.commenter_id}`} className="comment-author-link">
              <span className="comment-author">{comment.name}</span>
            </Link>
            <p className="comment-content">{comment.comment_content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentSection;