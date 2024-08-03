// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAlA42Iot_MKqWx2zJG-DX0GFe2v9erfv8",
  authDomain: "inventorymanagement-c5b1e.firebaseapp.com",
  projectId: "inventorymanagement-c5b1e",
  storageBucket: "inventorymanagement-c5b1e.appspot.com",
  messagingSenderId: "60310878124",
  appId: "1:60310878124:web:4765ad83fda4b41058ac09",
  measurementId: "G-58JGVDVYVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

export {firestore}