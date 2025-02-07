import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { db } from '../../firebase/Firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
    const { currentUser } = useAuth();
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                const userDoc = await getDoc(doc(db, 'Users', currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFname(userData.firstName || '');
                    setLname(userData.lastName || '');
                    setEmail(userData.email || '');
                }
            }
            setLoading(false);
        };
        fetchUserData();
    }, [currentUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (currentUser) {
            try {
                await updateDoc(doc(db, 'Users', currentUser.uid), {
                    firstName: fname,
                    lastName: lname,
                });
                navigate("/profile");
            } catch (error) {
                setMessage('Failed to update profile. Please try again.');
            }
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="edit-profile-container">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSave} className="edit-profile-form">
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        readOnly
                        className="read-only"
                    />
                </div>
                <div>
                    <label>First Name</label>
                    <input
                        type="text"
                        value={fname}
                        onChange={(e) => setFname(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div>
                    <label>Last Name</label>
                    <input
                        type="text"
                        value={lname}
                        onChange={(e) => setLname(e.target.value)}
                        className="input-field"
                    />
                </div>

                <button type="submit" className="save-button">Save Changes</button>
            </form>
            {message && (<p className={`message ${message.includes("success") ? "success" : "error"}`}>{message}</p>)}
        </div>
    );
};

export default EditProfile;
