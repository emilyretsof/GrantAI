import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/Firebase.js';


export const getFirestoreData = async (collectionName, docId, keyPath, defaultValue = null) => {
  try {
      const docRef = doc(db, collectionName, docId);
      const docSnapshot = await getDoc(docRef);
      console.log("Collection Name:", collectionName);
      console.log("Document ID:", docId);

      if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          return keyPath
              ? keyPath.split('.').reduce((obj, key) => obj?.[key], data)
              : data; // Return full data if keyPath is empty
      } else {
          console.warn(`Document with ID ${docId} not found.`);
          return defaultValue;
      }
  } catch (error) {
      console.error(`Error fetching Firestore data:`, error);
      return defaultValue;
  }
};

  export const setFirestoreData = async (collectionName, docId, data, merge = true) => {
    try {
      const docRef = doc(db, collectionName, docId);
      if (merge) {
        await updateDoc(docRef, data); // Merges with existing data
      } else {
        await setDoc(docRef, data); // Overwrites the entire document
      }
      console.log(`Successfully set data for document ${docId} in collection ${collectionName}`);
    } catch (error) {
      console.error(`Error setting data in ${collectionName}/${docId}:`, error);
    }
  };