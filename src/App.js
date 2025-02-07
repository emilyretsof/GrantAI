import Login from "./components/auth/Login.js";
import Register from "./components/auth/Register.js";

import Home from "./components/home/Home.js";
import SubmitAbstract from "./components/home/SubmitAbstract.js"
import Navbar from "./components/navbar/Navbar.js"
import Profile from "./components/profile/Profile.js"
import EditProfile from "./components/profile/EditProfile.js";
import { auth } from './firebase/Firebase.js';
import { useEffect } from "react";
import { useAuth, AuthProvider } from "./contexts/AuthContext.js";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import ViewSubmission from "./components/home/ViewSubmission.js";
import CompleteProfile from "./components/auth/CompleteProfile.js";
import { getFirestoreData } from "./firebase/Firestore.js";
import ProtectedRoute from "./components/routes/ProtectedRoute.js";


function App() {

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User info:", user);
      } else {
        console.log("No user is signed in.");
      }
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/home/submit-abstract" element={<ProtectedRoute message="You Must Log In to Submit an Abstract" redirectTo="/login"><SubmitAbstract /></ProtectedRoute>}/>
          <Route path="/home/view-submission" element={<ViewSubmission />} />

        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;