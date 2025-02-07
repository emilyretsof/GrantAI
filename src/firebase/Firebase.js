// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {getStorage} from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABE4oRm3wOZXIKfRxqqwZh0ZKvghzK6SI",
  authDomain: "grantai-762b9.web.app",
  projectId: "grantai-762b9",
  storageBucket: "grantai-762b9.firebasestorage.app",
  messagingSenderId: "204155285063",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth=getAuth(app);
export const db=getFirestore(app)
export const storage =getStorage(app)