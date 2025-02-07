import { doc, getDoc, updateDoc } from "firebase/firestore";
import { storage } from "../../firebase/Firebase.js";
import { ref, deleteObject } from "firebase/storage";
import { db } from "../../firebase/Firebase.js";

// DeleteAbstract Function
const DeleteAbstract = async (userId, index) => {

  try {
    // Step 1: Get the user document reference and snapshot
    const userDocRef = doc(db, "Users", userId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      const data = userDocSnapshot.data();
      const abstracts = data?.abstracts || []; // Fetch the abstracts array

      if (abstracts[index]) {
        const submissionToDelete = abstracts[index];
        const oldDocumentUrl = submissionToDelete.url;

        // Step 2: Delete the document from Firebase Storage
        if (oldDocumentUrl) {
          const oldDocumentRef = ref(storage, oldDocumentUrl);
          await deleteObject(oldDocumentRef);
          console.log("Old document deleted from Firebase Storage.");
        }

        // Step 3: Remove the submission from the abstracts array
        abstracts.splice(index, 1); // Remove the item at the given index

        // Step 4: Update Firestore with the modified array
        await updateDoc(userDocRef, { abstracts });
        console.log("Abstracts array updated in Firestore.");
      } else {
        console.log("No submission found at the provided index.");
      }
    } else {
      console.log("User document not found.");
    }
  } catch (error) {
    console.error("Error deleting submission: ", error);
    throw error; // Re-throw error for error handling in calling code
  }
};

export default DeleteAbstract;
