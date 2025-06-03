
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClQbj2EJYDJJPofhduul8hkKeGaBN8Zoo",
  authDomain: "profit-margin-b40ba.firebaseapp.com",
  projectId: "profit-margin-b40ba",
  storageBucket: "profit-margin-b40ba.firebasestorage.app",
  messagingSenderId: "968995959404",
  appId: "1:968995959404:web:d2e411666bacaa09e95e49",
  measurementId: "G-45ZK5WE072"
};

let app: FirebaseApp;

// Ensure Firebase is initialized only once
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db: Firestore = getFirestore(app);

export { app, db };
