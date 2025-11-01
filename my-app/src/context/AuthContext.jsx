// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
// Correctly import the API function for registration
import { loginUser, registerUser } from '../services/api'; 

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the AuthProvider component
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check for existing token in localStorage when app loads
    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (token && user) {
                setCurrentUser(JSON.parse(user));
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            // Clear bad data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        setLoading(false);
    }, []);

    // Login function (No changes needed here)
    const login = async (email, password) => {
        try {
            const response = await loginUser({ email, password });
            
            if (response.data && response.data.token) {
                const { token, user } = response.data;
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                setCurrentUser(user);
                setIsAuthenticated(true);
                
                return { success: true };
            }
            return { success: false, error: 'Invalid response from server.' };
            
        } catch (error) {
            console.error("Login failed:", error);
            const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
            return { success: false, error: errorMessage };
        }
    };

    // Corrected Register function
    const register = async (name, email, password, description, headline, summary, age) => {
        try {
            // Prepare the payload object exactly as the backend expects
            const payload = {
                name,
                email,
                password,
                description, // '0' or '1'
                headline,
                summary,
                // Use null for empty age, or the parsed integer
                age: age === '' ? null : parseInt(age) 
            };

            // *** Use the imported registerUser API function ***
            const response = await registerUser(payload); 
            
            // Assuming registerUser returns a 201 success without a token/user body
            if (response.status === 201) {
                 return { success: true };
            } else {
                 return { success: false, error: 'Registration failed due to server response.' };
            }
            
        } catch (error) {
            console.error("Registration failed:", error);
            // Return the specific error message from the backend
            return { 
                success: false, 
                error: error.response?.data?.error || 'Network error occurred.' 
            };
        }
    };

    // Logout function (No changes needed here)
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    // Value provided to all child components
    const value = {
        currentUser,
        isAuthenticated,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 3. Create the useAuth hook (No changes needed here)
export const useAuth = () => {
    return useContext(AuthContext);
};