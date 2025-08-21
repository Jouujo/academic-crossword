// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config object - you'll get this from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCizn3Za3UJisk9exKvyE1HTWO2Ak35uDw",
  authDomain: "academic-crossword.firebaseapp.com",
  projectId: "academic-crossword",
  storageBucket: "academic-crossword.firebasestorage.app",
  messagingSenderId: "484295170395",
  appId: "1:484295170395:web:d423446611fb84f4a7a27e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
export const db = getFirestore(app);

export default app;