// src/pages/JobOffersPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../services/api';
import { useAuth } from '../context/AuthContext'; 
import Navbar from '../components/common/Navbar.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';

// Simple function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

function JobOffersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Check if the user is an employer (description === '0')
  const isEmployer = currentUser && currentUser.description === '0';
  // Check if the user is an employee (description === '1') - they are the job seekers
  const isEmployee = currentUser && currentUser.description === '1';

  useEffect(() => {
    setLoading(true);
    getJobs()
      .then(res => {
        setJobs(res.data);
      })
      .catch(err => {
        console.error("Error fetching jobs:", err);
        setError("Could not load job offers.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Navbar />
      <div className="page-layout">
        <LeftSidebar />
        <main className="feed-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Job Offers</h1>
            
            {/* Button for Employer to Post a Job */}
            {isEmployer && (
              <Link to="/post-job" className="navbar-button" style={{ textDecoration: 'none' }}>
                Post a Job
              </Link>
            )}
          </div>

          <div className="job-list" style={{marginTop: '20px'}}>
            {loading && <div>Loading jobs...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            
            {!loading && !error && jobs.length === 0 && (
              <p>No job offers posted yet.</p>
            )}

            {!loading && !error && jobs.map(job => (
              // Reusing the .post-container style for job cards
              <div key={job.job_id} className="post-container">
                <div className="post-header">
                  <div>
                    <h2 style={{ margin: '0 0 5px 0' }}>{job.title}</h2>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{job.company}</p>
                    <p style={{ margin: 0, color: '#555' }}>{job.location}</p>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div className="post-time">
                      Posted by {job.posted_by_name}
                    </div>
                    <div className="post-time" style={{marginTop: '5px'}}>
                      {formatDate(job.created_at)}
                    </div>
                  </div>
                </div>

                <div className="post-content" style={{whiteSpace: 'pre-wrap', marginBottom: '20px'}}>
                  Job Summary:
                  <p>{job.description}</p>
                </div>
                
                {/* --- NEW CONTACT DETAILS SECTION --- */}
                {/* Show contact info ONLY if the logged-in user is an Employee (job seeker) */}
                {isEmployee && (
                    <div style={{ 
                        marginTop: '15px', 
                        borderTop: '1px solid var(--border-color)', 
                        paddingTop: '15px',
                        backgroundColor: '#f9f9f9',
                        padding: '10px',
                        borderRadius: '4px'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>How to Apply:</h3>
                        
                        {job.application_link && (
                            <p style={{ margin: '5px 0' }}>
                                🔗 Apply Online: <a href={job.application_link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary-teal)', marginLeft: '5px' }}>
                                    Click Here to Apply
                                </a>
                            </p>
                        )}
                        
                        {job.contact_email && (
                            <p style={{ margin: '5px 0' }}>
                                📧 Email: <a href={`mailto:${job.contact_email}`} style={{ color: 'var(--secondary-teal)', marginLeft: '5px' }}>
                                    {job.contact_email}
                                </a>
                            </p>
                        )}
                        
                        {job.contact_phone && (
                            <p style={{ margin: '5px 0' }}>
                                📞 Phone: {job.contact_phone}
                            </p>
                        )}
                        
                        {!job.application_link && !job.contact_email && !job.contact_phone && (
                            <p style={{ fontStyle: 'italic', color: '#777' }}>
                                No explicit contact or application link provided by the employer.
                            </p>
                        )}
                    </div>
                )}
                {/* --- END NEW CONTACT DETAILS SECTION --- */}

              </div>
            ))}
          </div>
        </main>
        <aside className="right-sidebar">
          {/* Placeholder */}
        </aside>
      </div>
    </div>
  );
}

export default JobOffersPage;