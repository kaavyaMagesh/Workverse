import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    getUserProfile, 
    getConnectionCount, 
    sendConnectionRequest, 
    acceptConnectionRequest,
    // Ensure this function is correctly exported from src/services/api.js
    uploadProfilePicture, 
} from '../services/api';

// 🌟 REQUIRED IMPORTS 🌟
import { FaUserCircle } from 'react-icons/fa'; 
import Navbar from '../components/common/Navbar.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';
import Modal from '../components/common/Modal.jsx'; 
import CreatePostForm from '../components/Post/CreatePostForm.jsx'; 

// --- NEW HELPER COMPONENT FOR PROFILE PICTURE UPLOAD (DEFINED OUTSIDE) ---
const ProfileUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setUploadError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setUploadError("Please select an image file.");
            return;
        }

        setUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('profileImage', selectedFile); 

        try {
            await uploadProfilePicture(formData);
            onUploadSuccess(); // Refresh profile data and close modal
        } catch (err) {
            console.error("Profile Upload Error:", err);
            setUploadError(err.response?.data?.error || "Failed to upload profile picture.");
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 bg-white rounded-lg shadow-xl" style={{ maxWidth: '400px', margin: 'auto' }}>
                <h3 className="text-xl font-bold mb-4">Update Profile Picture</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {uploadError && <p className="text-red-500 text-sm mb-3">{uploadError}</p>}
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || !selectedFile}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Save Picture'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
// -----------------------------------------------------

function ProfilePage() {
    const { userId } = useParams(); 
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [connectionCount, setConnectionCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Using two different modal states for clarity
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); 
    const [isPostModalOpen, setIsPostModalOpen] = useState(false); 

    const isSelf = currentUser && currentUser.userId === parseInt(userId);

    const fetchProfileData = useCallback(() => {
        setLoading(true);
        
        const profilePromise = getUserProfile(userId);
        const countPromise = getConnectionCount(userId);

        Promise.all([profilePromise, countPromise])
            .then(([profileRes, countRes]) => {
                setProfile(profileRes.data);
                setConnectionCount(countRes.data.count);
            })
            .catch(err => {
                console.error("Error fetching profile data:", err);
                if (err.response && err.response.status === 404) {
                    setError("Profile not found.");
                } else {
                    setError("Could not load profile due to a network error.");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId]); 

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleConnectionAction = async () => {
        if (!profile) return;
        
        const status = profile.connectionStatus;
        try {
            if (status === 'not_connected') {
                await sendConnectionRequest(userId);
            } else if (status === 'pending_received') {
                await acceptConnectionRequest(userId); 
            }
            fetchProfileData(); 
        } catch (err) {
            console.error("Error in connection action:", err);
            setError("An error occurred. Please try again.");
        }
    };

    const handleProfileUploadSuccess = () => {
        setIsUploadModalOpen(false); 
        fetchProfileData(); 
    };

    const renderActionButtons = () => {
        if (isSelf) {
            // FIX: Opens the new upload modal
            return (
                <button 
                    className="connect-button connected" 
                    onClick={() => setIsUploadModalOpen(true)}
                >
                    Edit Profile
                </button>
            );
        }

        if (!profile) return null;

        switch (profile.connectionStatus) {
            case 'not_connected':
                return <button className="connect-button not_connected" onClick={handleConnectionAction}>Connect</button>;
            case 'pending_sent':
                return <button className="connect-button pending_sent" disabled>Request Sent</button>;
            case 'pending_received':
                return <button className="connect-button pending_received" onClick={handleConnectionAction}>Accept</button>;
            case 'connected':
                return <button className="message-button" onClick={() => navigate(`/messages/${userId}`)}>Message</button>;
            default:
                return null;
        }
    };

    const handlePostCreated = () => {
        setIsPostModalOpen(false);
    };

    const getRoleDisplay = (description) => {
        if (description === '0') {
            return "Employer";
        } else if (description === '1') {
            return "Employee";
        }
        return "Role not specified";
    };

    // Show loading/error states...

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="page-layout">
                    <LeftSidebar onOpenCreatePostModal={() => setIsPostModalOpen(true)} />
                    <main className="profile-container"><div>Loading profile...</div></main>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Navbar />
                <div className="page-layout">
                    <LeftSidebar onOpenCreatePostModal={() => setIsPostModalOpen(true)} />
                    <main className="profile-container"><div style={{ color: 'red' }}>{error}</div></main>
                </div>
            </div>
        );
    }

    // Show main content
    return (
        <div>
            <Navbar />
            
            {/* Sidebar Create Post Modal */}
            <Modal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)}>
                <CreatePostForm onPostCreated={handlePostCreated} />
            </Modal>
            
            {/* Profile Picture Upload Modal */}
            <ProfileUploadModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={handleProfileUploadSuccess}
            />

            <div className="page-layout">
                <LeftSidebar onOpenCreatePostModal={() => setIsPostModalOpen(true)} />
                
                <main className="profile-container">
                    <div className="profile-card">
                        
                        {/* 🌟 PROFILE PICTURE DISPLAY LOGIC (WITH CIRCLE STYLES) 🌟 */}
                        <div className="profile-picture-container">
                            {profile.profile_image_url ? (
                                <img 
                                    src={`http://localhost:3001/${profile.profile_image_url}`} 
                                    alt={`${profile.name}'s profile`} 
                                    className="profile-picture"
                                    // 🌟 INLINE STYLES FOR CIRCLE AND SIZE 🌟
                                    style={{ 
                                        width: '96px', 
                                        height: '96px', 
                                        borderRadius: '50%', 
                                        objectFit: 'cover',
                                        border: '3px solid #0077b5'
                                    }}
                                />
                            ) : (
                                <FaUserCircle 
                                    className="profile-picture-placeholder" 
                                    size={96} 
                                    color="#0077b5" 
                                    style={{ borderRadius: '50%', border: '3px solid #0077b5' }}
                                />
                            )}
                        </div>
                        {/* ----------------------------------- */}

                        <h1>{profile.name}</h1>
                        <p className="profile-headline">{profile.headline || "No headline provided"}</p>
                        
                        <p className="profile-role" style={{ color: '#555', marginBottom: '10px' }}>
                            Role: {getRoleDisplay(profile.description)}
                        </p>
                        
                        <Link to="/connections" className="profile-connections">
                            {connectionCount} {connectionCount === 1 ? 'Connection' : 'Connections'}
                        </Link>

                        <div className="profile-actions">
                            {renderActionButtons()}
                        </div>
                        
                        <div className="profile-summary">
                            <h2>About</h2>
                            <p>{profile.summary || "No summary provided."}</p>
                        </div>
                    </div>
                </main>
                
                <aside className="right-sidebar">
                    {/* Placeholder */}
                </aside>
            </div>
        </div>
    );
}

export default ProfilePage;