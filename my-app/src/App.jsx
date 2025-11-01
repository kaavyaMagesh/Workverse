// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // To check if user is logged in

// --- Page Components ---
import FeedPage from './pages/FeedPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import MessagingPage from './pages/MessagingPage.jsx';
import ConnectionsPage from './pages/ConnectionsPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import JobOffersPage from './pages/JobOffersPage.jsx';
import PostJobPage from './pages/PostJobPage.jsx';
import PostViewPage from './pages/PostViewPage.jsx'; 

// --- Common Components ---
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Navbar from './components/common/Navbar.jsx'; // Import Navbar to show it? (No, Navbar is on each page)

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      <Routes>
        {/* --- PUBLIC ROUTES ---
          These are visible to everyone.
        */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- PROTECTED ROUTES ---
          These routes are wrapped by <ProtectedRoute>.
          If the user is not authenticated, they will be redirected to /login.
        */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<FeedPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/messages" element={<MessagingPage />} />
          <Route path="/messages/:userId" element={<MessagingPage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          
          {/* --- Placeholder Routes --- */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/jobs" element={<JobOffersPage />} />
          <Route path="/post-job" element={<PostJobPage />} />
          <Route path="/post/:postId" element={<PostViewPage />} />
        </Route>

        {/* --- CATCH-ALL ROUTE --- */}
        {/* If no other route matches, show a "Not Found" page */}
        <Route 
          path="*" 
          element={
            <main style={{ padding: '2rem' }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
              <a href={isAuthenticated ? "/" : "/login"}>Go to Home</a>
            </main>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;