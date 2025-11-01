// src/pages/SearchPage.jsx (MODIFIED)
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
// IMPORT NEW API FUNCTIONS
import { searchUsers, searchPosts, searchHashtags } from '../services/api'; 
// Assuming you create searchPosts and searchHashtags in services/api.js
import Navbar from '../components/common/Navbar';
import LeftSidebar from '../components/common/LeftSidebar.jsx'; // Include LeftSidebar

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q'); // The search term
    const category = searchParams.get('cat') || 'users'; // The category (default to 'users')

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const apiMap = {
        users: searchUsers,
        posts: searchPosts,
        hashtags: searchHashtags,
    };

    const fetchResults = useCallback(async () => {
        if (!query) {
            setResults([]);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const apiFunction = apiMap[category];
            if (!apiFunction) {
                setError(`Invalid search category: ${category}`);
                setLoading(false);
                return;
            }

            const response = await apiFunction(query);
            setResults(response.data);

        } catch (err) {
            console.error('Search failed:', err);
            setError(err.response?.data?.error || `Failed to fetch ${category} results.`);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [query, category]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    // Helper function to render results based on category
    const renderResults = () => {
        if (loading) return <div className="search-status">Loading results...</div>;
        if (error) return <div className="search-status error">{error}</div>;
        if (results.length === 0 && query) return <div className="search-status">No {category} found matching "{query}".</div>;
        if (results.length === 0 && !query) return <div className="search-status">Please enter a search term and select a category.</div>;

        if (category === 'users') {
            return (
                <div className="search-results-list">
                    {results.map((user) => (
                        <div key={user.user_id} className="search-result-item post-container">
                            <div className="search-result-info">
                                <Link to={`/profile/${user.user_id}`} className="search-result-name">
                                    {user.name}
                                </Link>
                                <p className="search-result-headline">{user.headline || 'No headline'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else if (category === 'posts' || category === 'hashtags') {
             // Posts/Hashtags results share the same structure (post_id, content, name)
            return (
                <div className="search-results-list">
                    {results.map((post) => (
                        <div key={post.post_id} className="search-result-item post-container">
                            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                Post by {post.name}:
                            </p>
                            <p className="search-result-content">
                                {post.content.substring(0, 150)}...
                            </p>
                            <Link to={`/post/${post.post_id}`} style={{ color: 'var(--secondary-teal)' }}>
                                View Post
                            </Link>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="search-page-wrapper">
            <Navbar /> 
            <div className="page-layout">
                {/* Include LeftSidebar */}
                <LeftSidebar /> 

                <main className="feed-container">
                    {query && <h2>Search Results for "{query}" in {category.toUpperCase()}</h2>}
                    {!query && <h2>Start Searching</h2>}
                    {renderResults()}
                </main>

                <aside className="right-sidebar">
                    {/* Empty 3rd column */}
                </aside>
            </div>
        </div>
    );
};

export default SearchPage;