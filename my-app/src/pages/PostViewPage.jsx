// src/pages/PostViewPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, getCommentsForPost, getHashtagsForPost } from '../services/api'; 
import Navbar from '../components/common/Navbar.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';

function PostViewPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        
        // Fetch the individual post data (assuming you create getPostById in api.js)
        getPostById(postId)
            .then(res => {
                setPost(res.data);
            })
            .catch(err => {
                console.error("Error fetching single post:", err);
                setError("Could not load post. It may have been deleted or the ID is invalid.");
            })
            .finally(() => {
                setLoading(false);
            });
            
        // You would typically fetch comments/hashtags here too.

    }, [postId]);

    if (loading) {
        return (
            <div className="page-layout"><Navbar /><main className="feed-container">Loading post...</main></div>
        );
    }
    
    if (error) {
        return (
            <div className="page-layout"><Navbar /><main className="feed-container error">{error}</main></div>
        );
    }
    
    if (!post) {
        return (
            <div className="page-layout"><Navbar /><main className="feed-container">Post not found.</main></div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="page-layout">
                <LeftSidebar />
                <main className="feed-container">
                    <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                        ← Back to Search Results
                    </button>
                    <div className="post-container">
                        <h2>{post.name}'s Post</h2>
                        <p>{post.content}</p>
                        {/* Render comments, hashtags here */}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default PostViewPage;