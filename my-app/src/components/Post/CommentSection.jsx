import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCommentsForPost, addCommentToPost } from '../../services/api';
import { useAuth } from '../../context/AuthContext'; // Import useAuth for instant user data

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth(); // Get current user (must contain userId and name)

  // Function to fetch all comments for the post
  const fetchComments = () => {
    setLoading(true);
    getCommentsForPost(postId)
      .then(response => {
        // Ensure response.data is an array before setting state
        if (Array.isArray(response.data)) {
          setComments(response.data);
        } else {
          setComments([]);
          console.warn("API returned non-array data for comments:", response.data);
        }
      })
      .catch(err => {
        console.error("Error fetching comments:", err);
        setError("Could not load comments. Check console for details.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Load comments when component mounts or postId changes
  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Handle new comment submission (Optimistic Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedComment = newComment.trim();
    if (!trimmedComment || !currentUser) return; // Prevent empty comments or if user is missing

    const commentData = {
      comment_content: trimmedComment,
    };

    try {
      // 1. Post the comment to the server
      const response = await addCommentToPost(postId, commentData);
      
      // 2. Prepare the new comment object using data from Auth and Server Response
      const postedComment = {
          comment_id: response.data.insertId, // Get the new ID from the server response
          comment_content: trimmedComment,
          commenter_id: currentUser.userId,   // Get the ID from context
          name: currentUser.name,             // Get the Name from context
          created_at: new Date().toISOString()
      };
      
      // 3. OPTIMISTIC UPDATE: Update state immediately with the new comment
      setComments(prevComments => [...prevComments, postedComment]);

      // 4. Clear input and errors
      setNewComment(''); 
      setError(''); 

    } catch (err) {
      console.error("Error adding comment:", err.response ? err.response.data : err.message);
      setError("Failed to post comment. Please try again.");
      
      // If the post failed, re-fetch the comments to ensure data is correct
      fetchComments(); 
    }
  };

  return (
    <div className="comment-section">
      <h3>Comments</h3>
      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          disabled={!currentUser}
        />
        <button type="submit" disabled={!newComment.trim() || !currentUser}>Post</button>
      </form>

      {loading && <div className="loading-message">Loading comments...</div>}
      {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}

      {!loading && comments.length === 0 && (
          <div className="no-comments">Be the first to comment!</div>
      )}

      <div className="comment-list">
        {comments.map(comment => (
          <div key={comment.comment_id} className="comment">
            <Link to={`/profile/${comment.commenter_id}`} className="comment-author-link">
              <span className="comment-author">
                {/* Use comment.name from the API or the optimistic update */}
                <strong>{comment.name || 'User'}</strong>
              </span>
            </Link>
            <p className="comment-content">{comment.comment_content}</p>
            <span className="comment-time">{new Date(comment.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentSection;