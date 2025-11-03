import axios from 'axios';

// The base URL for your back-end server
const API_URL = 'http://localhost:3001/api';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
});

// --- THIS IS THE MOST IMPORTANT PART ---
// Create an "interceptor" that adds the auth token to every request.
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from local storage
    const token = localStorage.getItem('token');
    
    if (token) {
      // If the token exists, add it to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// --- AUTH ---
export const loginUser = (credentials) => {
  return apiClient.post('/login', credentials);
};
export const registerUser = (userData) => {
  return apiClient.post('/register', userData);
};

// --- POSTS ---
export const getPosts = (sortOrder = 'latest') => {
  return apiClient.get(`/posts?sort=${sortOrder}`);
};
export const createPost = (postData) => {
  return apiClient.post('/posts', postData);
};
export const getHashtagsForPost = (postId) => {
  return apiClient.get(`/posts/${postId}/hashtags`);
};

// --- COMMENTS ---
export const getCommentsForPost = (postId) => {
  return apiClient.get(`/posts/${postId}/comments`);
};
export const addCommentToPost = (postId, commentData) => {
  return apiClient.post(`/posts/${postId}/comments`, commentData);
};

// --- PROFILE & CONNECTIONS ---
export const getUserProfile = (userId) => {
  return apiClient.get(`/users/${userId}`);
};

// 🌟 FIX: Adding the missing function 🌟
export const uploadProfilePicture = (formData) => {
    // formData contains the file and is sent to the backend's dedicated upload endpoint.
    // This is the function that ProfilePage.jsx was crashing due to its absence.
    return apiClient.post('/upload/profile', formData);
};
// ---------------------------------------------


export const getConnectionCount = (userId) => {
  return apiClient.get(`/users/${userId}/connections`);
};
export const getConnections = () => {
  return apiClient.get('/connections');
};
export const getAllUsersWithStatus = () => {
  return apiClient.get('/connections/all');
};
export const sendConnectionRequest = (receiverId) => {
  return apiClient.post('/connections/request', { receiverId });
};
export const acceptConnectionRequest = (requesterId) => {
  return apiClient.post('/connections/accept', { requesterId });
};

// --- MESSAGING ---
export const getConversations = () => {
  return apiClient.get('/messages/conversations');
};
export const getMessages = (otherUserId) => {
  return apiClient.get(`/messages/${otherUserId}`);
};
export const sendMessage = (messageData) => {
  return apiClient.post('/messages', messageData);
};

// =================================================================
// === SEARCH ENDPOINT (FIXED) ===
// =================================================================
/**
 * Fetches user profiles matching a search query.
 * The query is passed as a URL parameter (e.g., /search/users?q=name).
 * @param {string} query - The search term.
 */
export const searchUsers = (query) => {
  return apiClient.get('/search/users', { params: { q: query } });
};

// =================================================================
// === JOB ENDPOINTS (UPDATED) ===
// =================================================================
export const getJobs = () => {
  return apiClient.get('/jobs');
};

export const createJob = (jobData) => {
  return apiClient.post('/jobs', jobData);
};

// In src/services/api.js (Add these)
// ...
export const searchPosts = (query) => {
    return apiClient.get('/search/posts', { params: { q: query } });
};

export const searchHashtags = (query) => {
    return apiClient.get('/search/hashtags', { params: { q: query } });
};
// ...

export const getPostById = (postId) => {
    return apiClient.get(`/posts/${postId}`);
};