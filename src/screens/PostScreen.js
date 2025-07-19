import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, Modal, KeyboardAvoidingView, Alert } from 'react-native';
import { auth, db } from '../api/firebaseConfig';
import { collection, addDoc, query, onSnapshot } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper function to convert URI to Blob (works on Android/Expo)
const uriToBlob = (uri) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new Error('uriToBlob failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

const PostScreen = ({ modalVisible, setModalVisible }) => {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([]);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userPostsRef = collection(db, "users", user.uid, "posts");
      const q = query(userPostsRef);
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const postsArray = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            timestamp: data.timestamp.toDate(),
            imageUrl: data.imageUrl || null,
          };
        });
        setPosts(postsArray);
      });
      return () => unsubscribe();
    } else {
      setPosts([]);
    }
  }, [auth.currentUser]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (postText.trim() === '' && !image) {
      Alert.alert("Please enter some text or select an image to post.");
      return;
    }
    setUploading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("No user signed in");
        setUploading(false);
        return;
      }
      let imageUrl = '';
      if (image) {
        // Use uriToBlob instead of fetch().blob()
        const blob = await uriToBlob(image);
        const storage = getStorage();
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}.jpg`);
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      }
      const userPostsRef = collection(db, "users", user.uid, "posts");
      await addDoc(userPostsRef, {
        text: postText,
        timestamp: new Date(),
        imageUrl: imageUrl || '',
      });
      setPostText('');
      setImage(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding post:", error);
    }
    setUploading(false);
  };

  // Group posts by date
  const groupedPosts = posts.reduce((acc, post) => {
    const date = post.timestamp.toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(post);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedPosts).sort((a, b) => new Date(b) - new Date(a));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {sortedDates.length === 0 && (
          <View style={styles.centered}>
            <Image source={require("../../assets/icons/camera.png")} style={{ height: 50, width: 60, tintColor: 'grey', margin: 10 }} />
            <Text style={{ color: 'grey', fontSize: 20 }}>
              Start sharing posts
            </Text>
            <Text style={{ color: 'grey', marginTop: 5, fontSize: 16, width: "80%", textAlign: "center" }}>
              Once you do, the posts will show up here.
            </Text>
          </View>
        )}
        {sortedDates.map(date => (
          <View key={date} style={{ marginBottom: 24, marginHorizontal: 20 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, marginLeft: 4 }}>{date}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {groupedPosts[date].map(post => post.imageUrl ? (
                <Image key={post.id} source={{ uri: post.imageUrl }} style={styles.postImage} />
              ) : null)}
            </View>
            {groupedPosts[date].map(post => post.text && !post.imageUrl ? (
              <View key={post.id} style={styles.textCard}>
                <Text style={styles.textCardText}>{post.text}</Text>
                <Text style={styles.timestamp}>{post.timestamp.toLocaleTimeString()}</Text>
              </View>
            ) : null)}
          </View>
        ))}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.fullScreenModalView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post</Text>
            <TouchableOpacity onPress={handlePost} disabled={uploading}>
              <Text style={[styles.postText, uploading && { color: 'gray' }]}>{uploading ? 'Posting...' : 'Post'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            multiline
            value={postText}
            onChangeText={setPostText}
          />
          <Button title="Pick an image" onPress={pickImage} />
          {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginTop: 10, borderRadius: 12 }} />}
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#03A9F4',
    borderRadius: 28,
    elevation: 8,
    zIndex: 1000,
  },
  fabIcon: {
    fontSize: 24,
    color: 'white',
  },
  fullScreenModalView: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelText: {
    color: 'blue',
    fontSize: 18,
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  textCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  textCardText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
  },
  input: {
    fontSize: 18,
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: 10,
    padding: 10,
    marginBottom: 20,
  },
});

export default PostScreen;