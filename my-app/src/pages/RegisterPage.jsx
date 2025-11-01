// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // New Fields
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [age, setAge] = useState('');
  
  // Modified Description state to hold the selected role ('employer' or 'employee')
  const [role, setRole] = useState('employee'); // Default to 'employee' (value 1)
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth(); // Using register from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Map the 'role' string to the required database description value (0 or 1)
    const dbDescription = role === 'employer' ? '0' : '1'; 
    // The server handles 'description' as a string/VARCHAR, so we pass '0' or '1' as a string.

    // 2. Prepare the data payload for the register function
    const registrationData = {
        name,
        email,
        password,
        description: dbDescription, // Use the mapped value
        headline,
        summary,
        // Ensure age is passed as a number or NULL if empty, the backend handles this.
        // For simplicity with the existing backend function signature, we pass all fields.
        age: age ? parseInt(age) : null
    };

    // NOTE: Your current register function in AuthContext only takes (name, email, password, description).
    // You will need to UPDATE your AuthContext.js's register function to accept all these new fields:
    // const { success, error } = await register(name, email, password, dbDescription, headline, summary, age);
    
    // Assuming your register function is updated to take a single object payload for flexibility:
    // If not, you must update the function call and the AuthContext.
    // For now, let's call the function with the necessary arguments, assuming you will adapt AuthContext.
// Inside RegisterPage.jsx's handleSubmit
// Make sure you are passing 7 arguments to the register function
    const { success, error } = await register(
        name, 
        email, 
        password, 
        dbDescription, 
        headline, 
        summary, 
        age
    );


    setLoading(false);
    if (success) {
      // On success, redirect to the login page
      navigate('/login'); 
    } else {
      setError(error || 'Failed to register. Please try again.');
    }
  };

  // If user is already logged in, redirect them to the feed
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <form onSubmit={handleSubmit}>
          <h1>Create an Account</h1>
          
          {error && <p className="auth-error">{error}</p>}
          
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* --- New Field: Headline --- */}
          <div className="form-group">
            <label htmlFor="headline">Headline</label>
            <input
              type="text"
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g., Software Engineer | Full-Stack Developer"
            />
          </div>

          {/* --- New Field: Summary --- */}
          <div className="form-group">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows="3"
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', boxSizing: 'border-box' }}
              placeholder="A brief overview of your professional experience."
            />
          </div>

          {/* --- New Field: Age --- */}
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="18"
              max="99"
              placeholder="e.g., 25"
            />
          </div>

          {/* --- Modified Field: Description/Role (Radio Buttons) --- */}
          <div className="form-group">
            <label>I am a:</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="employee"
                  checked={role === 'employee'}
                  onChange={() => setRole('employee')}
                /> 
                Employee
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="employer"
                  checked={role === 'employer'}
                  onChange={() => setRole('employer')}
                /> 
                Employer
              </label>
            </div>
          </div>


          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          
          <div className="auth-switch">
            <p>Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;