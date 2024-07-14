import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Linking, Image, Alert } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../api/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import colors from '../../assets/colors/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const emailValidator = (email) => {
  // This is a simple regex for basic email validation
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(true); // Password initially hidden
  const [isEmailValid, setIsEmailValid] = useState(null); // null, true, or false
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  const handleSignUp = async () => {
    if (!agreeToTerms) {
      Alert.alert('Error', 'You must agree to the terms and conditions to sign up.');
      return;
    }

    if (!isEmailValid) {
      Alert.alert('Error', 'Email not valid. Please enter a valid email address.');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredentials) => {
        // Create a document in Firestore after account creation
        const userDocRef = doc(db, 'users', userCredentials.user.uid);
        await setDoc(userDocRef, {
          email: email,
          createdAt: new Date() // Add other initial fields as needed
        });

        await AsyncStorage.setItem('isNewUser', 'true'); // Set isNewUser to true on successful sign-up
        sendEmailVerification(userCredentials.user)
          .then(() => {
            Alert.alert('Success', 'Verification email sent! Please check your email to verify your account.');
            navigation.replace('SignInScreen');
          })
          .catch((error) => {
            console.error('Error sending email verification', error);
            Alert.alert('Error', 'Error sending email verification');
          });
      })
      .catch((error) => {
        switch (error.code) {
          case 'auth/email-already-in-use':
            Alert.alert('Error', 'An account with this email already exists.');
            break;
          case 'auth/invalid-email':
            Alert.alert('Error', 'The email address is not valid.');
            break;
          case 'auth/weak-password':
            Alert.alert('Error', 'The password is too weak. Password must be at least 6 characters.');
            break;
          default:
            Alert.alert('Error', 'Error signing up: ' + error.message);
        }
      });
  };

  // const resendVerificationEmail = () => {
  //   if (auth.currentUser && !auth.currentUser.emailVerified) {
  //     sendEmailVerification(auth.currentUser)
  //       .then(() => {
  //         alert('Verification email resent. Please check your inbox.');
  //       })
  //       .catch((error) => {
  //         alert('Error resending email verification: ' + error.message);
  //       });
  //   } else {
  //     alert('User not found or email already verified.');
  //   }
  // };

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setIsEmailValid(emailValidator(text));
  };

  const openURL = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Account</Text>

      <Text style={styles.inputHeader}>Your Email</Text>

      <View style={styles.inputField}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={handleEmailChange}
          autoCapitalize="none"
          style={styles.input}
        />
        {isEmailValid !== null && (
          <Image
            source={
              isEmailValid
                ? require('../../assets/images/check-icon.png')
                : require('../../assets/images/cross-icon.png')
            }
            style={styles.emailIcon}
          />
        )}
      </View>

      <Text style={styles.inputHeader}>Password</Text>

      <View style={styles.inputField}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={passwordVisibility} // Toggles the text visibility
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

      <View style={styles.termsWrapper}>
        <TouchableOpacity onPress={() => setAgreeToTerms(!agreeToTerms)} style={styles.checkbox}>
          {agreeToTerms ? <Text style={styles.checkboxText}>✓</Text> : null}
        </TouchableOpacity>
        <Text style={styles.termsText}>
          I agree to the
          <Text style={styles.link} onPress={() => openURL('https://policies.google.com/terms?hl=en-US')}> Terms & Conditions </Text>
          and
          <Text style={styles.link} onPress={() => openURL('https://policies.google.com/privacy?hl=en-US')}> Privacy Policy</Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Create account</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity style={styles.googleButton}>
        <Image source={require('../../assets/icons/googleSignIn.png')} style={styles.icon} />
        <Text style={styles.googleButtonText}>Sign up with Google</Text>
      </TouchableOpacity> */}

      <View style={styles.footer}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('SignInScreen')}>
          <Text style={styles.link}>Log in</Text>
        </TouchableOpacity>
      </View>
      {/* {verificationEmailSent && (
        <TouchableOpacity style={styles.resendButton} onPress={resendVerificationEmail}>
          <Text style={styles.resendButtonText}>Resend Verification Email</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'left',
    color: colors.text, // Use your color scheme
    marginTop: 40,
  },
  inputHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    color: colors.text, // Use your color scheme
    marginBottom: 5,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 8,
    marginBottom: 30,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  emailIcon: {
    width: 20,
    height: 20,
  },
  visibilityIcon: {
    padding: 10, // Adds padding for easier touch
  },
  illustration: {
    width: 28, // Adjust width as necessary
    height: 28, // Adjust height as necessary
    tintColor: colors.secondary, // Use a color that matches your scheme, but slightly muted
  },
  termsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  checkbox: {
    height: 20,
    width: 20,
    borderWidth: 1,
    borderColor: '#cccccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxText: {
    fontWeight: 'bold',
  },
  link: {
    color: '#0000ff',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 14,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderColor: '#0000ff',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  googleButtonText: {
    color: '#0000ff',
    fontSize: 18,
  },
  icon: {
    width: 20,
    height: 20,
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    color: '#0000ff',
    textDecorationLine: 'underline',
  },
  resendButton: {
    marginTop: 20,
    backgroundColor: colors.primary, // Assuming you have a secondary color
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default SignUpScreen;