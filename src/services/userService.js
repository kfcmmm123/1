import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../api/firebaseConfig';

// Create user profile in Firestore when they sign up
export const createUserProfile = async (userData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, {
      uid: currentUser.uid,
      email: currentUser.email,
      name: userData.name || currentUser.email,
      createdAt: new Date(),
      ...userData
    });

    return { success: true, message: 'User profile created successfully' };
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId = null) => {
  try {
    const currentUser = auth.currentUser;
    const targetUserId = userId || currentUser?.uid;
    
    if (!targetUserId) throw new Error('No user ID provided');

    const userRef = doc(db, 'users', targetUserId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('User profile not found');
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (updates) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });

    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Check if user profile exists, create if not
export const ensureUserProfile = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create basic profile if it doesn't exist
      await setDoc(userRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        name: currentUser.displayName || currentUser.email,
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error);
  }
}; 