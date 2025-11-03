import React, { useState } from 'react';
import { createPost } from '../../services/api';

function CreatePostForm({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  // 🌟 NEW STATE: To hold the selected image file 🌟
  const [selectedFile, setSelectedFile] = useState(null);
  // ----------------------------------------------
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    // Get the first file selected by the user
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validation: Must have content OR an image
    if (!content.trim() && !selectedFile) {
      setError('Please provide post content or select an image.');
      return;
    }

    setIsPosting(true);
    setError('');

    // 🌟 Use FormData for multipart/form-data payload 🌟
    const formData = new FormData();
    formData.append('content', content);
    formData.append('hashtags', hashtags);

    if (selectedFile) {
      // Key MUST match 'postImage' as defined in server.js's upload.single('postImage')
      formData.append('postImage', selectedFile); 
    }
    // ----------------------------------------------------

    // Note: createPost in api.js must be updated to handle FormData correctly
    createPost(formData) 
      .then(response => {
        console.log('Post created!', response.data);
        setContent(''); // Clear content
        setHashtags(''); // Clear hashtags
        setSelectedFile(null); // Clear selected file
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
          style={{ marginBottom: '10px' }}
          
        />
        
        {/* 🌟 NEW: File Input 🌟 */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isPosting}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        {selectedFile && <p style={{ fontSize: '0.8rem', color: '#555' }}>Selected: {selectedFile.name}</p>}
        {/* ------------------------- */}

        {/* --- HASHTAGS TEXTAREA --- */}
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