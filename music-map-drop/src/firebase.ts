import { initializeApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAezUJJ8EITvFuu_sYTA8KtOqEYtXNZqeg",
  authDomain: "flashback-25e2f.firebaseapp.com",
  projectId: "flashback-25e2f",
  storageBucket: "flashback-25e2f.firebasestorage.app",
  messagingSenderId: "455429581660",
  appId: "1:455429581660:web:27714c2456182577222f99",
  measurementId: "G-5JD4XDL43L"
};

const app = initializeApp(firebaseConfig);
export const functions = getFunctions(app, "us-central1");

// Connect to emulator in development
if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, "localhost", 5001);
  
  // Connect to Firestore emulator (if running)
  try {
    const db = getFirestore(app);
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("Connected to Firestore emulator");
  } catch (error) {
    // Emulator already connected, ignore
    console.log("Firestore emulator connection:", error);
  }
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// Export callable functions
export const createDrop = httpsCallable(functions, "createDrop");