import React, { useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { auth, db } from "../../firebase/Firebase.js";
import { setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import './Auth.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const location = useLocation();
    const auth_header = location.state?.message; // Access the passed message (if any)


    const onSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        if (!isRegistering) {
            setIsRegistering(true);
            try {
                // Create user in Firebase Auth
                const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = newUserCredential.user;

                if (user) {
                    // Store user info in Firestore
                    await setDoc(doc(db, "Users", user.uid), {
                        email: user.email,
                        firstName: fname,
                        lastName: lname,
                        statuses: {
                            is_applicant: false,
                        },
                    });

                    // Send email verification
                    await sendEmailVerification(user);

                    // Sign out the user immediately to prevent navigation before verification
                    await signOut(auth);

                    // Set state to indicate email verification is pending
                    setIsEmailSent(true);
                    setErrorMessage('');
                }
            } catch (error) {
                setErrorMessage(error.message || 'Failed to register');
                setIsRegistering(false);
            }
        }
    };

    return (
        <>
            {isEmailSent ? (
                <main className="auth-container">
                    <div className="verification-card">                        
                        <div className="verification-header">
                            <h3>Verify Your Email</h3>
                        </div>
                        <p className="verification-message"> 
                            A verification email has been sent to <strong>{email}</strong><br /> 
                            Please verify your email and then login.
                        </p>
                        <Link to="/login" className="submit-button">
                            Go to Login Page
                        </Link>
                    </div>
                </main>
            ) : (
                <main className="auth-container">
                {auth_header && (
                    <div className="auth-card">
                        <div className="auth-header"><p>{auth_header}</p></div>
                    </div> 
                )}
                    <div className="auth-card">
                        <div className="auth-header">
                            <h3>Create a New Account</h3>
                        </div>
                        <form onSubmit={onSubmit} className="auth-form">
                            <div className="text-sm text-gray-600 font-bold">
                                <label>First name</label>
                                <input
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={fname}
                                    onChange={(e) => { setFname(e.target.value); }}
                                    className="input-field"
                                />
                            </div>

                            <div className="text-sm text-gray-600 font-bold">
                                <label>Last name</label>
                                <input
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={lname}
                                    onChange={(e) => { setLname(e.target.value); }}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 font-bold">Email</label>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); }}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 font-bold">Password</label>
                                <input
                                    disabled={isRegistering}
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
                                    disabled={isRegistering}
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
                                disabled={isRegistering}
                                className={`submit-button ${isRegistering ? 'bg-gray-300 cursor-not-allowed' : ''}`}
                            >
                                {isRegistering ? 'Signing Up...' : 'Sign Up'}
                            </button>

                            <div className="auth-footer">
                                Already have an account? {' '}
                                <Link to={'/login'}>Sign in</Link>
                            </div>
                        </form>
                    </div>
                </main>
            )}
        </>
    );
};

export default Register;
