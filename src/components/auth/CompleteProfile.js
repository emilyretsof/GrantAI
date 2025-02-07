import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from "../../firebase/Firebase.js";
import { updatePassword } from 'firebase/auth';
import './Auth.css';

const CompleteProfile = () => {
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const auth_header = location.state?.message; // Access the passed message (if any)


    useEffect(() => {
        // Fetch user data to prefill fields
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const docRef = doc(db, "Users", user.uid);
                    const userDoc = await getDoc(docRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setFname(userData.firstName || '');
                        setLname(userData.lastName || '');
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!fname || !lname || !password || !confirmPassword) {
            setErrorMessage('Please fill out all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        if (!isUpdating) {
            setIsUpdating(true);
            try {
                const user = auth.currentUser;

                if (user) {
                    const docRef = doc(db, "Users", user.uid);

                    // Update Firestore with new details
                    await setDoc(doc(db, "Users", user.uid), {
                        email: user.email,
                        firstName: fname,
                        lastName: lname,
                        statuses: {
                            is_applicant: false,
                        },
                    });

                    await updatePassword(user, password);

                    console.log("Profile updated successfully.");
                    navigate('/'); // Redirect to dashboard or another page
                }
            } catch (error) {
                setErrorMessage('Failed to update profile. Please try again.');
                console.error("Error updating profile:", error);
            } finally {
                setIsUpdating(false);
            }
        }
    };

    return (
        <main className="auth-container">
            {auth_header && (
                <div className="auth-card">
                    <div className="auth-header"><p>{auth_header}</p></div>
                </div> 
            )}
            <div className="auth-card">
                <div className="auth-header">
                    <h3>Complete Your Profile</h3>
                </div>
                <form onSubmit={onSubmit} className="auth-form">
                    <div className="text-sm text-gray-600 font-bold">
                        <label>First Name</label>
                        <input
                            type="text"
                            required
                            value={fname}
                            onChange={(e) => setFname(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    <div className="text-sm text-gray-600 font-bold">
                        <label>Last Name</label>
                        <input
                            type="text"
                            required
                            value={lname}
                            onChange={(e) => setLname(e.target.value)}
                            className="input-field"
                        />
                    </div>


                    <div>
                        <label className="text-sm text-gray-600 font-bold">Password</label>
                        <input
                            disabled={isUpdating}
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); }}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 font-bold">Confirm Password</label>
                        <input
                            disabled={isUpdating}
                            type="password"
                            autoComplete="off"
                            required
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); }}
                            className="input-field"
                        />
                    </div>


                    {errorMessage && (
                        <span className="error-message">{errorMessage}</span>
                    )}

                    <button
                        type="submit"
                        disabled={isUpdating}
                        className={`submit-button ${isUpdating ? 'bg-gray-300 cursor-not-allowed' : ''}`}
                    >
                        {isUpdating ? 'Updating...' : 'Complete Profile'}
                    </button>
                </form>
            </div>
        </main>
    );
};

export default CompleteProfile;
