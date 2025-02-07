import '../../App.css'
import './Profile.css'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.js'
import { useNavigate, Link } from 'react-router-dom';
import { doSignOut } from '../../firebase/Auth.js';  // Import the sign-out function
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/Firebase.js';

const Profile = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [firstName, setFirstName] = useState('');  // State for first name
    const [loading, setLoading] = useState(true);  // State to track loading
    const [error, setError] = useState('');  // State for error handling

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'Users', currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setFirstName(userData.firstName || '');  // Set first name from Firestore
                    }
                } catch (err) {
                    setError('Error fetching user data');
                }
            }
            setLoading(false);  // Stop loading once data is fetched
        };
        fetchUserData();
    }, [currentUser]);

    // Handle sign out
    const logoutHandler = async () => {
        try {
            await doSignOut();  // Call signOut from auth.js
            navigate('/');  // Redirect to the home page or login page
        } catch (error) {
            console.error("Error during sign-out:", error.message);
        }
    };

    // Handle edit profile button click
    const editProfileHandler = () => {
        navigate('/edit-profile');  // Navigate to Edit Profile page
    };

    if (loading) return <p>Loading...</p>;  // Show loading message while fetching data

    return (
        <div className="profile-container">
            <div className="profile-card">
                <p className="welcome-message"> Welcome {firstName ? firstName : "Guest"}!</p>
                <div className="profile-actions">
                    <button className="edit-profile-button" onClick={editProfileHandler}>Edit Profile</button>
                    <button className="logout-button" onClick={logoutHandler}>Log Out</button>
                </div>
                {error && <p className="error-message">{error}</p>} {/* Display error message if any */}
            </div>
        </div>
    );
};

export default Profile;
