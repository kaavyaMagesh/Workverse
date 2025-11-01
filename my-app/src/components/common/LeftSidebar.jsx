// src/components/common/LeftSidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; 

function LeftSidebar({ onOpenCreatePostModal }) {
  const { currentUser } = useAuth(); 

  // --- LOGIC CORRECTION ---
  // The description is stored as a string ('0' or '1')
  // Employer check: description === '0'
  const isEmployer = currentUser?.description === '0'; 
  
  // Optional: define isEmployee for explicit readability in the link text
  // Employee check: description === '1'
  const isEmployee = currentUser?.description === '1';

  // Determine the correct path and text based on the role
  const jobLinkPath = isEmployer ? "/post-job" : "/jobs";
  const jobLinkText = isEmployer ? "Post Job" : "Job Offers";

  return (
    <aside className="left-sidebar">
      <nav>
        <ul>
          <li>
            <button className="sidebar-button" onClick={onOpenCreatePostModal}>
              Create Post
            </button>
          </li>
          <li>
            <Link to="/messages" className="sidebar-link">
              Messages
            </Link>
          </li>
          <li>
            <Link 
              to="/connections" 
              className="sidebar-link" 
              style={{backgroundColor: 'var(--secondary-teal)', marginTop:'10px'}}
            >
              Connections
            </Link>
          </li>
          
          {/* --- CONDITIONAL JOB LINK --- */}
          {/* We only show this link if the user is authenticated */}
          {currentUser && (
            <li>
              <Link 
                to={jobLinkPath} 
                className="sidebar-link" 
                style={{backgroundColor: 'var(--light-blue-bg)', color: 'var(--primary-text-color)', marginTop:'10px'}}
              >
                {jobLinkText}
              </Link>
            </li>
          )}

        </ul>
      </nav>
    </aside>
  );
}

export default LeftSidebar;