# Chat System Implementation

This document explains the complete chat system implementation for VolunTrack Mobile.

## Features

### 1. Friend Management
- **Add Friends via Email**: Users can send friend requests by entering email addresses
- **Friend Requests**: Users can accept or reject incoming friend requests
- **Friend List**: View all accepted friends

### 2. Real-time Chat
- **Real-time Messaging**: Messages are sent and received in real-time using Firebase Firestore
- **Chat History**: All messages are stored and retrieved from Firestore
- **Auto-scroll**: Chat automatically scrolls to the latest message
- **Message Timestamps**: Each message shows when it was sent

### 3. User Interface
- **MailScreen**: Shows Friends and Chat tabs with search functionality
- **ChatScreen**: Full chat interface with message bubbles and input
- **FriendRequestScreen**: Manage friend requests and send new ones

## How It Works

### Database Structure

#### Firestore Collections:

1. **users** - User profiles
   ```
   users/{userId}
   - uid: string
   - email: string
   - name: string
   - createdAt: timestamp
   ```

2. **friendRequests** - Pending friend requests
   ```
   friendRequests/{requestId}
   - fromUserId: string
   - fromUserName: string
   - fromUserEmail: string
   - toUserId: string
   - toUserEmail: string
   - status: 'pending' | 'accepted' | 'rejected'
   - createdAt: timestamp
   ```

3. **friends** - Accepted friend relationships
   ```
   friends/{friendshipId}
   - userId: string
   - friendId: string
   - friendName: string
   - friendEmail: string
   - addedAt: timestamp
   ```

4. **chats** - Chat rooms
   ```
   chats/{chatId}
   - participants: [userId1, userId2]
   - lastMessage: string
   - lastMessageTime: timestamp
   - createdAt: timestamp
   ```

5. **chats/{chatId}/messages** - Individual messages
   ```
   messages/{messageId}
   - senderId: string
   - senderName: string
   - text: string
   - timestamp: timestamp
   ```

### Key Functions

#### Friend Management:
- `sendFriendRequest(email)` - Send friend request to user by email
- `acceptFriendRequest(requestId)` - Accept a friend request
- `rejectFriendRequest(requestId)` - Reject a friend request
- `getFriendRequests(callback)` - Listen for incoming friend requests
- `getFriends(callback)` - Listen for friends list

#### Chat Management:
- `createChat(friendId)` - Create or get existing chat with friend
- `sendMessage(chatId, message)` - Send message to chat
- `getChatMessages(chatId, callback)` - Listen for messages in chat
- `getUserChats(callback)` - Listen for user's chats

## Usage Instructions

### 1. Adding Friends
1. Navigate to the Mail tab (Contact in bottom navigation)
2. Tap the person-add icon in the top right
3. Enter the friend's email address
4. Tap "Send" to send friend request

### 2. Managing Friend Requests
1. In the FriendRequestScreen, view pending requests
2. Tap the checkmark to accept or X to reject
3. Accepted friends will appear in your Friends list

### 3. Starting a Chat
1. Go to Friends tab and tap on a friend
2. Or go to Chat tab to see existing conversations
3. Tap on any chat to open the conversation

### 4. Sending Messages
1. In ChatScreen, type your message
2. Tap the send button or press Enter
3. Messages appear in real-time

## Security Rules

Make sure your Firestore security rules allow:
- Users to read/write their own data
- Users to read friend requests sent to them
- Users to read/write chats they participate in
- Users to read public user profiles (for friend requests)

Example rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Friend requests
    match /friendRequests/{requestId} {
      allow read, write: if request.auth != null && 
        (resource.data.fromUserId == request.auth.uid || 
         resource.data.toUserId == request.auth.uid);
    }
    
    // Friends
    match /friends/{friendshipId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/chats/$(chatId)).data.participants[request.auth.uid] != null;
    }
  }
}
```

## Testing

To test the chat system:

1. **Create two test accounts** with different email addresses
2. **Sign in with one account** and send a friend request to the other
3. **Sign in with the second account** and accept the friend request
4. **Start a chat** between the two accounts
5. **Send messages** back and forth to test real-time functionality

## Troubleshooting

### Common Issues:

1. **"User not found" error**: Make sure the target user has signed up and has a profile in Firestore
2. **Messages not appearing**: Check Firestore security rules and internet connection
3. **Friend requests not working**: Ensure both users have valid email addresses and profiles

### Debug Tips:

- Check Firebase Console for any Firestore errors
- Verify user authentication status
- Check network connectivity
- Review Firestore security rules

## Future Enhancements

Potential improvements:
- Push notifications for new messages
- Message read receipts
- File/image sharing
- Group chats
- Message encryption
- Typing indicators
- Online/offline status 