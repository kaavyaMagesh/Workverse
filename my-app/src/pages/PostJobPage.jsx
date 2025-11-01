// src/pages/PostJobPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';

function PostJobPage() {
  // Existing Fields
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  
  // --- NEW CONTACT FIELDS ---
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [applicationLink, setApplicationLink] = useState('');
  // --------------------------
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const isEmployer = currentUser && currentUser.description === '0';

  // If a non-employer tries to access this page, redirect them
  useEffect(() => {
    if (currentUser && !isEmployer) {
      navigate('/jobs'); 
    }
  }, [isEmployer, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Data for your new 'jobs' table
    const jobData = { 
      title, 
      company, 
      location, 
      description,
      // --- INCLUDE NEW CONTACT FIELDS IN PAYLOAD ---
      contact_email: contactEmail,
      contact_phone: contactPhone,
      application_link: applicationLink 
      // ---------------------------------------------
    };

    try {
      await createJob(jobData);
      setLoading(false);
      navigate('/jobs'); // Redirect to job offers page on success
    } catch (err) {
      console.error("Error posting job:", err);
      setError(err.response?.data?.error || "Failed to post job. Please try again.");
      setLoading(false);
    }
  };

  // Don't render the form if they aren't an employer
  if (!currentUser || !isEmployer) {
    return (
      <div>
        <Navbar />
        <div className="page-layout">
          <LeftSidebar />
          <main>
            <p>You do not have permission to post jobs. Redirecting...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="page-layout">
        <LeftSidebar />
        <main className="feed-container">
          <h1>Post a New Job</h1>
          <p>Fill out the form below to post a job opening.</p>
          
          <div className="auth-form" style={{ maxWidth: '100%', padding: '2rem', marginTop: '20px' }}>
            <form onSubmit={handleSubmit}>
              {error && <p className="auth-error">{error}</p>}
              
              {/* Primary Job Fields */}
              <div className="form-group">
                <label htmlFor="title">Job Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="company">Company Name</label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location (e.g., "City, State" or "Remote")</label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Job Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="10"
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
              
              {/* --- CONTACT DETAILS SECTION --- */}
              <h2 style={{marginTop: '30px', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>Contact & Application Details (Optional)</h2>

              {/* Contact Email */}
              <div className="form-group">
                <label htmlFor="contactEmail">Contact Email</label>
                <input
                  type="email"
                  id="contactEmail"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="email@company.com"
                />
              </div>

              {/* Contact Phone */}
              <div className="form-group">
                <label htmlFor="contactPhone">Contact Phone (Optional)</label>
                <input
                  type="tel"
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(123) 456-7890"
                />
              </div>

              {/* Application Link */}
              <div className="form-group">
                <label htmlFor="applicationLink">External Application Link (URL)</label>
                <input
                  type="url"
                  id="applicationLink"
                  value={applicationLink}
                  onChange={(e) => setApplicationLink(e.target.value)}
                  placeholder="https://company.com/apply-here"
                />
              </div>
              {/* ----------------------------------- */}

              <button type="submit" disabled={loading} style={{width: 'auto', padding: '0.75rem 1.5rem', marginTop: '20px'}}>
                {loading ? 'Posting...' : 'Post Job'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PostJobPage;