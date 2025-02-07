import React, { useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../firebase/Auth.js';
import { auth } from '../../firebase/Firebase.js'; // Import Firebase auth
import { useAuth } from '../../contexts/AuthContext.js';
import './Auth.css'; // Import the CSS file
import { getFirestoreData, setFirestoreData } from '../../firebase/Firestore.js';
import { useNavigate } from 'react-router-dom';
const Login = () => {
    const location = useLocation();
    const login_header = location.state?.message; // Access the passed message (if any)
    const redirectTo = location.state?.from || "/home";

    const { userLoggedIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [emailVerified, setEmailVerified] = useState(false); // New state to track email verification
    const [isRedirecting, setIsRedirecting] = React.useState(false);

    const navigate = useNavigate(); // Get navigate function
    const handleRedirect = () => {
        setIsRedirecting(true);
    };

    const handleLogin = async (user) => {
        if (!user.emailVerified) {
            setErrorMessage("Please verify your email before logging in.");
            console.log("User's email is not verified:", user.email);
            setEmailVerified(false);
            await auth.signOut();
            return;
        }
    
        try {
            console.log("Checking Firestore for user:", user.uid);
    
            const userExists = await getFirestoreData("Users", user.uid, "", null);
            console.log("Firestore query result:", userExists);
    
            if (userExists) {
                console.log("User exists in Firestore. Proceeding with login.");
                setEmailVerified(true);
                navigate(redirectTo, { replace: true });
            } else {
                console.log("User does not exist in Firestore. Redirecting to registration.");
                await auth.signOut();
                handleRedirect();
            }
        } catch (error) {
            console.error("Error in handleLogin:", error);
            setErrorMessage("An error occurred during login. Please try again.");
        }
    };
    
    
    const onSubmit = async (e) => {
        e.preventDefault();
    
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                // Sign in the user
                const userCredential = await doSignInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                // Pass the user object to handleLogin for email verification and navigation
                await handleLogin(user);
            } catch (error) {
                setErrorMessage("Incorrect email or password."); // Friendly error message
            } finally {
                setIsSigningIn(false); // Reset signing in state
            }
        }
    };

    const onGoogleSignIn = async (e) => {
        e.preventDefault();
    
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                const result = await doSignInWithGoogle(); // Sign in with Google
                const user = result.user;
    
                if (user) {
                    console.log("Google Sign-In successful:", user.uid);
    
                    // Use utility function to check if user exists in Firestore
                    const existingUserData = await getFirestoreData("Users", user.uid, null);
                    // error fetching Firestore data

                    if (!existingUserData) {
                        console.log("No Firestore User Doc");
                        handleRedirect();
                        setErrorMessage("Please complete your profile."); // Optionally redirect them to a profile completion page
                    } else {
                        // User exists, proceed to login
                        console.log("Existing user. Logging in...");
                        await handleLogin(user); // Your custom login handler
                    }
                }
            } catch (error) {
                console.error("Google Sign-In error:", error);
                if (error.code === "auth/popup-closed-by-user") {
                    setErrorMessage("Google Sign-In was canceled. Please try again.");
                } else {
                    setErrorMessage("Google Sign-In failed. Please try again.");
                }
            } finally {
                setIsSigningIn(false);
            }
        }
    };
    

    if (isRedirecting) {
        // Redirect to /register and pass the message in the state
        return (
            <Navigate to="/complete-profile" state={{ message: "You need to register first." }} />
        );
    }
    

    return (
        <div>
            {/* Only navigate if user is logged in and email is verified */}
            {userLoggedIn && emailVerified && <Navigate to={redirectTo} replace={true} />}

            <main className="auth-container">
                {login_header && (
                    <div className="auth-card">
                        <div className="auth-header">
                        <p>{login_header}</p>
                        </div>
                    </div>
                )}
                <div className="auth-card">
                    <div className="auth-center">
                        <div className="auth-header">
                            <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Login</h3>
                        </div>
                    </div>
                    <form onSubmit={onSubmit} className="auth-form">
                        <div>
                            <label className="text-sm text-gray-600 font-bold">Email</label>
                            <input
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                }}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600 font-bold">Password</label>
                            <input
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                                className="input-field"
                            />
                        </div>

                        {errorMessage && <span className="error-message">{errorMessage}</span>}

                        <button
                            type="submit"
                            disabled={isSigningIn}
                            className={`submit-button ${
                                isSigningIn
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'
                            }`}
                        >
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </button>
                        <p className="auth-footer">
                            Don't have an account?{' '}
                            <Link to={'/register'} className="hover:underline font-bold">
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
                <button
                    type="submit"
                    disabled={isSigningIn}
                    onClick={(e) => {
                        onGoogleSignIn(e);
                    }}
                    className={`google-button ${isSigningIn ? 'disabled' : 'enabled'}`}
                >
                    {isSigningIn ? (
                        'Signing In...'
                    ) : (
                        <>
                            <img src="/images/google-sign-in.png" alt="Google Sign-In" />
                        </>
                    )}
                </button>
            </main>
        </div>
    );
};

export default Login;
