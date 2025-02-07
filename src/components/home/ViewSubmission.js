import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { db } from '../../firebase/Firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './SubmitAbstract.css';
import DeleteAbstract from './DeleteAbstract.js';

const ViewSubmission = () => {
  const { currentUser } = useAuth();
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/home/submit-abstract'); // Navigates to the SubmitAbstract page.
  };

  const handleDeleteSubmission = async (index) => {
    if (!currentUser) return;
  
    try {
      await DeleteAbstract(currentUser.uid, index); // Pass userId and index to DeleteAbstract
      alert("Your submission has been deleted.");
  
      // Optimistically update the local state to reflect deletion
      setAbstracts((prevAbstracts) => prevAbstracts.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Failed to delete the submission. Please try again.");
    }
  };

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'Users', currentUser.uid));
          if (userDoc.exists()) {
            const abstractFiles = userDoc.data()?.abstracts || [];
            console.log('Fetched abstracts:', abstractFiles); // Log the data for debugging
            setAbstracts(abstractFiles); // Assuming abstract is an array of submissions
          } else {
            console.log('No user data found');
          }
        } catch (error) {
          console.error('Error fetching submission details:', error);
        }
      }
      setLoading(false);
    };

    fetchSubmissionDetails();
  }, [currentUser]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="view-submission-page">
      <div className="view-submission-container">
        <p className="submission-header">Thank You for Your Submission</p>
        <p className="submission-message">
          Your abstract is currently being processed. <br />
          We will contact you if there are any updates to your submission status.<br />
          Thank you for your patience.
        </p>

        {/* Render buttons for each submission */}
        {abstracts.length > 0 ? (
          <div className="button-group">
            {abstracts.map((submission, index) => (
              <div key={index} className="submission-item">
                <button
                  onClick={() => window.open(submission.url, "_blank", "noopener,noreferrer")}
                  className="view-submission-button"
                >
                  {submission.name || `View Submission ${index + 1}`}
                </button>
                <button
                  onClick={() => handleDeleteSubmission(index)}
                  className="delete-submission-button"
                  title="Delete Submission" // Tooltip for accessibility
                >
                  × {/* The "x" symbol */}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No submissions found. Please ensure your submission was successful.</p>
        )}

        <button onClick={handleNavigate} className="new-abstract-button">
          Upload Another Abstract
        </button>
      </div>
    </div>
  );
};

export default ViewSubmission;
