import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.js";
import { Navigate, useLocation } from "react-router-dom"; // Import only what's needed
import { getFirestoreData } from "../../firebase/Firestore.js";

const ProtectedRoute = ({ children, redirectTo = "/login", message = null }) => {
  const { userLoggedIn, currentUser } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    console.log("Inside ProtectedRoute:");
    console.log("userLoggedIn:", userLoggedIn);
    console.log("user:", currentUser);
    const checkUserExists = async () => {
      console.log("Current user:", currentUser);
      if (currentUser) {
        const data = await getFirestoreData("Users", currentUser.uid, "", null);
        setUserExists(!!data); // Update the state based on Firestore data
      } else {
        setUserExists(false);
      }
      setLoading(false); // Loading complete
    };

    checkUserExists();
  }, [currentUser]);

  if (!userLoggedIn) {
    return (
      <Navigate
        to={redirectTo}
        state={{ message, from: location }}
        replace
      />
    );
  }

  if (loading) {
    // Optional: Add a loading spinner while checking user existence
    return <div>Loading...</div>;
  }

  if (!userExists) {
    return (
      <Navigate
        to="/complete-profile"
        state={{ message: "Please complete your profile before proceeding", from: location }}
        replace
      />
    );
  }

  return children; // Render the protected content
};

export default ProtectedRoute;
