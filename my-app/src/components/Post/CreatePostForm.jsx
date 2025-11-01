// src/components/Post/CreatePostForm.jsx
import React, { useState } from 'react';
import { createPost } from '../../services/api';

function CreatePostForm({ onPostCreated }) {
  const [content, setContent] = useState('');
  // --- NEW STATE FOR HASHTAGS ---
  const [hashtags, setHashtags] = useState('');
  // ------------------------------
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    setIsPosting(true);
    setError('');

    // Send both content and hashtags to the API service
    const postData = {
      content: content,
      hashtags: hashtags, // Will be processed by the API function
    };

    createPost(postData)
      .then(response => {
        console.log('Post created!', response.data);
        setContent(''); // Clear content
        setHashtags(''); // Clear hashtags
        onPostCreated(); // Tell the parent component to refresh/close
      })
      .catch(err => {
        console.error('Error creating post:', err);
        // Display the error returned from the server if available
        setError(err.response?.data?.error || 'Failed to create post. Please try again.');
      })
      .finally(() => {
        setIsPosting(false); // Re-enable the button
      });
  };

  return (
    <div className="create-post-container">
      <h2>Create a new post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? (Your post content)"
          rows="5"
          disabled={isPosting}
          required
        />
        
        {/* --- NEW HASHTAGS TEXTAREA --- */}
        <textarea
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="Add hashtags (e.g., project, update, #reactjs). Separate them with commas."
          rows="1"
          disabled={isPosting}
          style={{ marginTop: '10px', resize: 'vertical' }}
        />
        {/* ----------------------------- */}

        <div className="form-footer">
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={isPosting}>
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePostForm;