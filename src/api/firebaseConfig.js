// Importing Firebase utilities
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Import environment variables from .env file

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyACm3swv3gxxhdoOSXGn_dGO83jN7idrCA",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "volun-track.firebaseapp.com",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "https://volun-track-default-rtdb.firebaseio.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "volun-track",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "volun-track.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "348051927128",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:348051927128:web:30169cf42d5053de5c1a2d",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-WDQ5PPH1ZJ",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage), 
});

// Initialize Firestore
export const db = getFirestore(app);

// Export the Firebase app instance
export { app };
