// Importing Firebase utilities
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Import environment variables from .env file
const firebaseConfig = {
  apiKey: "AIzaSyACm3swv3gxxhdoOSXGn_dGO83jN7idrCA",
  authDomain: "volun-track.firebaseapp.com",
  databaseURL: "https://volun-track-default-rtdb.firebaseio.com",
  projectId: "volun-track",
  storageBucket: "volun-track.firebasestorage.app",
  messagingSenderId: "348051927128",
  appId: "1:348051927128:web:30169cf42d5053de5c1a2d",
  measurementId: "G-WDQ5PPH1ZJ"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

// Export the Firebase app instance
export { app };
