// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUgEevdwoYGD9caoDIdoiTYNKt6NeyXuM",
  authDomain: "thoughtchronicle-200b8.firebaseapp.com",
  projectId: "thoughtchronicle-200b8",
  storageBucket: "thoughtchronicle-200b8.firebasestorage.app",
  messagingSenderId: "718953940652",
  appId: "1:718953940652:web:caf53b1c6514f2c0a5c109",
  measurementId: "G-FP3LS3BBSX"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
const analytics = getAnalytics(FIREBASE_APP);