import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Image, Alert, Modal, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import colors from '../../assets/colors/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../api/firebaseConfig';

const SignInScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(true); // Password initially hidden
  const [emailVerificationNeeded, setEmailVerificationNeeded] = useState(false);

  useEffect(() => {
    if (route.params?.needVerification) {
      setEmailVerificationNeeded(true);
    }
  }, [route.params?.needVerification]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user && userCredential.user.emailVerified) {
        // Fetch additional user data from Firestore
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          // Add email and password for storage
          const storedData = {
            ...userData,
            email: email,  // Storing the email in the user data object
            password: password  // Storing the password in the user data object (use with caution)
          };
          // Store the enhanced user data in AsyncStorage
          await AsyncStorage.setItem('@user_data', JSON.stringify(storedData));
          await AsyncStorage.setItem('bannerMessage', 'Signed in successfully!');
          await AsyncStorage.setItem('bannerType', 'success');
          await AsyncStorage.setItem('resetFirstLoad', 'true');
          const isNewUser = await AsyncStorage.getItem('isNewUser');
          const targetScreen = isNewUser === 'true' ? 'UserInfoScreen' : 'Profile';
          await AsyncStorage.removeItem('isNewUser');
          setLoading(false);
          navigation.navigate(targetScreen);
        } else {
          console.error("No such user!");
          Alert.alert('Error', 'No user data available.');
          setLoading(false);
        }
      } else {
        await AsyncStorage.setItem('bannerMessage', 'Failed to sign in.');
        await AsyncStorage.setItem('bannerType', 'error');
        setLoading(false);
      }
    } catch (error) {
      // Error handling based on error.code
      switch (error.code) {
        case 'auth/invalid-email':
          alert('The email address is not valid.');
          break;
        case 'auth/user-disabled':
          alert('The user account has been disabled by an administrator.');
          break;
        case 'auth/user-not-found':
          alert('There is no user corresponding to the email address.');
          break;
        case 'auth/wrong-password':
          alert('The password is wrong for the given email.');
          break;
        default:
          alert('Error signing in: ' + error.message);
      }
    }
  };


  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  const handleForgotPassword = async () => {
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        Alert.alert('Reset Email Sent', 'Password reset link sent! Check your email.');
      } catch (error) {
        console.error('Reset password error:', error);
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Error', 'Please enter your email address.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign In</Text>
      <Text style={styles.inputHeader}>Your Email</Text>
      <View style={styles.inputField}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.input}
        />
      </View>
      <Text style={styles.inputHeader}>Password</Text>
      <View style={styles.inputField}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={passwordVisibility}
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.visibilityIcon}
          onPress={togglePasswordVisibility}
        >
          {passwordVisibility ?
            <Image source={require('../../assets/icons/hidePassword.png')} style={styles.illustration} />
            :
            <Image source={require('../../assets/icons/showPassword.png')} style={styles.illustration} />
          }
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={handleForgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
      {emailVerificationNeeded && (
        <Text style={styles.verificationMessage}>
          Please check your email to verify your account before signing in.
        </Text>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={loading}
      // onRequestClose={() => {
      //   setLoading(false);
      // }}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'left',
    color: colors.text,
    marginTop: 40,
  },
  inputHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    color: colors.text,
    marginBottom: 5,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 8,
    marginBottom: 25,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  visibilityIcon: {
    padding: 10, // Adds padding for easier touch
  },
  illustration: {
    width: 28, // Adjust width as necessary
    height: 28, // Adjust height as necessary
    tintColor: colors.secondary, // Use a color that matches your scheme, but slightly muted
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  forgotPassword: {
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  verificationMessage: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  loadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignInScreen;