import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db, auth } from '../api/firebaseConfig';

// Friend Management
export const sendFriendRequest = async (targetEmail) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Get current user's data
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const currentUserData = currentUserDoc.data();

    // Find target user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', targetEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    const targetUserDoc = querySnapshot.docs[0];
    const targetUserId = targetUserDoc.id;

    // Check if already friends or request pending
    const existingRequest = await checkExistingFriendRequest(currentUser.uid, targetUserId);
    if (existingRequest) {
      throw new Error('Friend request already sent or users are already friends');
    }

    // Create friend request
    await addDoc(collection(db, 'friendRequests'), {
      fromUserId: currentUser.uid,
      fromUserName: currentUserData?.name || currentUser.email,
      fromUserEmail: currentUser.email,
      toUserId: targetUserId,
      toUserEmail: targetEmail,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    return { success: true, message: 'Friend request sent successfully' };
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

export const acceptFriendRequest = async (requestId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Get the friend request
    const requestRef = doc(db, 'friendRequests', requestId);
    const requestDoc = await getDoc(requestRef);
    const requestData = requestDoc.data();

    if (!requestData || requestData.toUserId !== currentUser.uid) {
      throw new Error('Invalid friend request');
    }

    // Update request status
    await updateDoc(requestRef, { status: 'accepted' });

    // Get current user's data for the friend relationship
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const currentUserData = currentUserDoc.data();

    // Add to friends collection for both users
    const friendsRef = collection(db, 'friends');
    
    // Add friend relationship for current user
    await addDoc(friendsRef, {
      userId: currentUser.uid,
      friendId: requestData.fromUserId,
      friendName: requestData.fromUserName || requestData.fromUserEmail || 'Friend',
      friendEmail: requestData.fromUserEmail,
      addedAt: serverTimestamp()
    });

    // Add friend relationship for the other user
    await addDoc(friendsRef, {
      userId: requestData.fromUserId,
      friendId: currentUser.uid,
      friendName: currentUserData?.name || currentUser.email,
      friendEmail: currentUser.email,
      addedAt: serverTimestamp()
    });

    return { success: true, message: 'Friend request accepted' };
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

export const rejectFriendRequest = async (requestId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    const requestRef = doc(db, 'friendRequests', requestId);
    const requestDoc = await getDoc(requestRef);
    const requestData = requestDoc.data();

    if (!requestData || requestData.toUserId !== currentUser.uid) {
      throw new Error('Invalid friend request');
    }

    await updateDoc(requestRef, { status: 'rejected' });
    return { success: true, message: 'Friend request rejected' };
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

export const getFriendRequests = (callback) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const requestsRef = collection(db, 'friendRequests');
  
  // First, try with the composite index query
  const q = query(
    requestsRef, 
    where('toUserId', '==', currentUser.uid),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const requests = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    callback(requests);
  }, (error) => {
    // If the composite index doesn't exist, fall back to a simpler query
    if (error.code === 'failed-precondition') {
      console.log('Composite index not found for friend requests, using fallback query');
      const fallbackQuery = query(
        requestsRef,
        where('toUserId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );
      
      return onSnapshot(fallbackQuery, (snapshot) => {
        const requests = [];
        snapshot.forEach((doc) => {
          requests.push({ id: doc.id, ...doc.data() });
        });
        // Sort manually in JavaScript
        requests.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const timeB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return timeB - timeA;
        });
        callback(requests);
      });
    } else {
      console.error('Error getting friend requests:', error);
      callback([]);
    }
  });
};

export const getFriends = (callback) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const friendsRef = collection(db, 'friends');
  const q = query(friendsRef, where('userId', '==', currentUser.uid));

  return onSnapshot(q, (snapshot) => {
    const friends = [];
    snapshot.forEach((doc) => {
      friends.push({ id: doc.id, ...doc.data() });
    });
    callback(friends);
  });
};

// Chat Management
export const createChat = async (friendId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Check if chat already exists
    const existingChat = await findExistingChat(currentUser.uid, friendId);
    if (existingChat) {
      return existingChat;
    }

    // Create new chat
    const chatRef = await addDoc(collection(db, 'chats'), {
      participants: [currentUser.uid, friendId],
      lastMessage: null,
      lastMessageTime: null,
      createdAt: serverTimestamp()
    });

    return chatRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const sendMessage = async (chatId, message) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Add message to chat
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: currentUser.uid,
      senderName: currentUser.email,
      text: message,
      timestamp: serverTimestamp()
    });

    // Update chat's last message
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: message,
      lastMessageTime: serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getChatMessages = (chatId, callback) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
};

export const getUserChats = (callback) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const chatsRef = collection(db, 'chats');
  
  // First, try with the composite index query
  const q = query(
    chatsRef, 
    where('participants', 'array-contains', currentUser.uid),
    orderBy('lastMessageTime', 'desc')
  );

  return onSnapshot(q, async (snapshot) => {
    const chats = [];
    
    // Process each chat to include friend information
    for (const doc of snapshot.docs) {
      const chatData = doc.data();
      
      // Find the other participant (not the current user)
      const otherParticipantId = chatData.participants.find(id => id !== currentUser.uid);
      
      if (otherParticipantId) {
        try {
          // Get the other user's information from the friends collection
          const friendsRef = collection(db, 'friends');
          const friendQuery = query(
            friendsRef,
            where('userId', '==', currentUser.uid),
            where('friendId', '==', otherParticipantId)
          );
          const friendSnapshot = await getDocs(friendQuery);
          
          let friendName = 'Friend';
          let friendEmail = '';
          
          if (!friendSnapshot.empty) {
            const friendData = friendSnapshot.docs[0].data();
            friendName = friendData.friendName || friendData.friendEmail || 'Friend';
            friendEmail = friendData.friendEmail || '';
          } else {
            // Fallback: try to get user info from users collection
            try {
              const userDoc = await getDoc(doc(db, 'users', otherParticipantId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                friendName = userData.name || userData.email || 'Friend';
                friendEmail = userData.email || '';
              }
            } catch (error) {
              console.log('Could not fetch user info for:', otherParticipantId);
            }
          }
          
          chats.push({
            id: doc.id,
            ...chatData,
            friendId: otherParticipantId,
            friendName: friendName,
            friendEmail: friendEmail
          });
        } catch (error) {
          console.error('Error processing chat:', error);
          // Add chat with fallback info
          chats.push({
            id: doc.id,
            ...chatData,
            friendId: otherParticipantId,
            friendName: 'Friend',
            friendEmail: ''
          });
        }
      }
    }
    
    // Sort manually if needed
    chats.sort((a, b) => {
      const timeA = a.lastMessageTime?.toDate?.() || a.lastMessageTime || new Date(0);
      const timeB = b.lastMessageTime?.toDate?.() || b.lastMessageTime || new Date(0);
      return timeB - timeA;
    });
    
    callback(chats);
  }, (error) => {
    // If the composite index doesn't exist, fall back to a simpler query
    if (error.code === 'failed-precondition') {
      console.log('Composite index not found, using fallback query');
      const fallbackQuery = query(
        chatsRef,
        where('participants', 'array-contains', currentUser.uid)
      );
      
      return onSnapshot(fallbackQuery, async (snapshot) => {
        const chats = [];
        
        // Process each chat to include friend information
        for (const doc of snapshot.docs) {
          const chatData = doc.data();
          
          // Find the other participant (not the current user)
          const otherParticipantId = chatData.participants.find(id => id !== currentUser.uid);
          
          if (otherParticipantId) {
            try {
              // Get the other user's information from the friends collection
              const friendsRef = collection(db, 'friends');
              const friendQuery = query(
                friendsRef,
                where('userId', '==', currentUser.uid),
                where('friendId', '==', otherParticipantId)
              );
              const friendSnapshot = await getDocs(friendQuery);
              
              let friendName = 'Friend';
              let friendEmail = '';
              
              if (!friendSnapshot.empty) {
                const friendData = friendSnapshot.docs[0].data();
                friendName = friendData.friendName || friendData.friendEmail || 'Friend';
                friendEmail = friendData.friendEmail || '';
              } else {
                // Fallback: try to get user info from users collection
                try {
                  const userDoc = await getDoc(doc(db, 'users', otherParticipantId));
                  if (userDoc.exists()) {
                    const userData = userDoc.data();
                    friendName = userData.name || userData.email || 'Friend';
                    friendEmail = userData.email || '';
                  }
                } catch (error) {
                  console.log('Could not fetch user info for:', otherParticipantId);
                }
              }
              
              chats.push({
                id: doc.id,
                ...chatData,
                friendId: otherParticipantId,
                friendName: friendName,
                friendEmail: friendEmail
              });
            } catch (error) {
              console.error('Error processing chat:', error);
              // Add chat with fallback info
              chats.push({
                id: doc.id,
                ...chatData,
                friendId: otherParticipantId,
                friendName: 'Friend',
                friendEmail: ''
              });
            }
          }
        }
        
        // Sort manually in JavaScript
        chats.sort((a, b) => {
          const timeA = a.lastMessageTime?.toDate?.() || a.lastMessageTime || new Date(0);
          const timeB = b.lastMessageTime?.toDate?.() || b.lastMessageTime || new Date(0);
          return timeB - timeA;
        });
        callback(chats);
      });
    } else {
      console.error('Error getting user chats:', error);
      callback([]);
    }
  });
};

// Helper functions
const checkExistingFriendRequest = async (fromUserId, toUserId) => {
  const requestsRef = collection(db, 'friendRequests');
  const q = query(
    requestsRef,
    where('fromUserId', '==', fromUserId),
    where('toUserId', '==', toUserId)
  );
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

const findExistingChat = async (userId1, userId2) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId1)
  );
  const querySnapshot = await getDocs(q);
  
  for (const doc of querySnapshot.docs) {
    const chatData = doc.data();
    if (chatData.participants.includes(userId2)) {
      return doc.id;
    }
  }
  return null;
}; 

// Debug function to fix incorrect toUserId in friend requests
export const fixFriendRequestToUserId = async (requestId, correctToUserId) => {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    await updateDoc(requestRef, { toUserId: correctToUserId });
    console.log('Fixed toUserId for request:', requestId);
    return { success: true };
  } catch (error) {
    console.error('Error fixing friend request:', error);
    throw error;
  }
}; 