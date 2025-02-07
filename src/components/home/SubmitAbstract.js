import React, { useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, storage } from "../../firebase/Firebase.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import{useAuth} from "../../contexts/AuthContext.js"
import './SubmitAbstract.css'
import { useNavigate, Link } from 'react-router-dom';
import {setFirestoreData} from '../../firebase/Firestore.js';
import { arrayUnion } from "firebase/firestore";

const SubmitAbstract = () => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(""); // Clear previous messages
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }
  
    setUploading(true);
  
    try {
      console.log("Starting file upload...");
  
      // Step 1: Create a reference to Firebase Storage for the new file
      const fileRef = ref(storage, `abstracts/${currentUser.uid}/${file.name}`);
      console.log("File reference created:", fileRef.fullPath);
  
      // Step 2: Upload the file to Firebase Storage
      await uploadBytes(fileRef, file);
      console.log("File uploaded successfully.");
  
      // Step 3: Get the download URL of the new file
      const downloadURL = await getDownloadURL(fileRef);
      console.log("Download URL retrieved:", downloadURL);
  
      // Step 4: Append the new abstract to the "abstracts" array in Firestore
      const userRef = doc(db, "Users", currentUser.uid);
  
      // Use Firestore's arrayUnion method to append new abstract data
      await updateDoc(userRef, {
        abstracts: arrayUnion({
          name: file.name,
          url: downloadURL,
          uploadedAt: new Date().toISOString(), // Optional metadata
        }),
      });
  
      const userStatusUpdate = { statuses: { isApplicant: true } };
      await setFirestoreData("Users", currentUser.uid, userStatusUpdate, true); // Merge with existing data
  
      console.log("Firestore updated successfully.");
      navigate("/home/view-submission");
  
    } catch (error) {
      console.error("Error during file upload:", error);
      setMessage("Failed to upload the file. Please try again.");
    } finally {
      setUploading(false);
      setFile(null); // Clear the file input
    }
  };
  

  return (
    <div className="submit-abstract-page">
      <div className="submit-abstract-container">
        <h2 className="text-2xl font-bold pt-14">Abstract Submission Portal</h2>
        {message && (
          <p className={`message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </p>
        )}
  
        <div className="file-upload">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            className="file-input"
          />
          <button
            onClick={handleFileUpload}
            disabled={uploading}
            className="upload-button"
          >
            {uploading ? "Uploading..." : "Upload Abstract"}
          </button>
        </div>
      </div>
  
      <div className="submission-guidelines">
        <h3>Submission Guidelines</h3>
        <ul>
          <li>Submit your abstract by <strong>March 21, 2025, 11:59 PM PST</strong>.</li>
          <li>The abstract should be no more than <strong>500 words</strong> (excluding references).</li>
          <li>Ensure the abstract is anonymized (no personal identifiers).</li>
          <li>If submitting work done with a team or professor, submit verification from the PI if the abstract is accepted.</li>
        </ul>
      </div>
    </div>
  );
  
};

export default SubmitAbstract;
