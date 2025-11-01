// src/pages/FeedPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getPosts } from '../services/api';

// Import all the components
import Navbar from '../components/common/Navbar.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';
import Modal from '../components/common/Modal.jsx';
import CreatePostForm from '../components/Post/CreatePostForm.jsx';
import Post from '../components/Post/Post.jsx';

function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('latest');
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

  // Function to fetch posts
  const fetchPosts = useCallback(() => {
    setLoading(true);
    getPosts(sortOrder)
      .then(response => {
        setPosts(response.data);
      })
      .catch(err => {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Are you logged in?");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sortOrder]); // Re-run if sortOrder changes

  // Fetch posts on mount (and when fetchPosts function changes)
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Function to be called after a post is created
  const handlePostCreated = () => {
    setIsModalOpen(false); // Close the modal
    fetchPosts(); // Refresh the feed
  };

  return (
    <div>
      <Navbar />
      
      {/* Modal for creating a post */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreatePostForm onPostCreated={handlePostCreated} />
      </Modal>

      <div className="page-layout">
        {/* --- Left Sidebar --- */}
        <LeftSidebar onOpenCreatePostModal={() => setIsModalOpen(true)} />
        
        {/* --- Main Feed Content --- */}
        <main className="feed-container">
          <h1>Post Feed</h1>

          <div className="filter-bar">
            <label htmlFor="sort-select">Sort by: </label>
            <select 
              id="sort-select"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
          
          <div className="post-list">
            {loading && <div>Loading posts...</div>}
            {error && <div style={{color: 'red'}}>{error}</div>}
            
            {!loading && !error && posts.map(post => (
              <Post key={post.post_id} post={post} />
            ))}
          </div>
        </main>
        
        {/* --- Right Sidebar (Placeholder) --- */}
        <aside className="right-sidebar">
          {/* You can add "Who to follow" or "Trending" here later */}
        </aside>
      </div>
    </div>
  );
}

export default FeedPage;