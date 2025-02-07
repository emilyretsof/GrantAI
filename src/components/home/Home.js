import React, { useEffect, useState } from 'react';
import '../../App.css';
import './Home.css';
import { useAuth } from '../../contexts/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import {getFirestoreData} from '../../firebase/Firestore.js'

const Home = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isApplicant, setisApplicant] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetch(
          "https://data.ca.gov/api/3/action/datastore_search?resource_id=111c8c88-21f6-453c-ae2c-b4785a0624f5&limit=5&q=%7B%22Categories%22%3A%22Education%22%7D"
        )
          .then((response) => response.json())
          .then((result) => {
            if (result.success) {
              setData(result.result.records); // Extract the records array
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            setLoading(false);
          });
      }, []);

    const navToViewSubmision = () => {
        navigate('/home/view-submission'); // Navigate to View Submission if the user is an applicant
    };
    const navToSubmitAbstract = () => {
        navigate('/home/submit-abstract'); // Navigate to Submit Abstract if the user is not an applicant
    };

    return (
        <div className="home-page">
            <img
                src="/images/banner.png"
                alt="banner"
                className="header-image"
            />
            
    <div className="data-container">
      <h2>Data from API</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="data-list">
          {data.map((item, index) => (
            <div key={index} className="data-item">
              {Object.entries(item).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {value || "N/A"}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>

                {/* Conditionally Render Buttons */}
                {isApplicant ? (
                    <button onClick={navToViewSubmision} className="view-submission-button"> View Submission Status</button>
                ) : (
                    <button onClick={navToSubmitAbstract} className="submit-abstract-button"> Submit An Abstract</button>
                )}
        </div>
    );
};

export default Home;
