import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const SignInUpScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            {/* Logo */}
            <Image
                source={require('../../assets/adaptive-icon-cropped.png')} // Replace with your logo path
                style={styles.logo}
            />

            {/* Heading */}
            <View style={styles.headerView}>
                <Text style={styles.heading}>
                        Your first step to making a bigger difference.
                </Text>
            </View>
 

            {/* Buttons */}
            <TouchableOpacity
                style={styles.signInButton}
                onPress={() => navigation.navigate('SignInScreen')}
            >
                <Text style={styles.signInButtonText}>Sign In to Your Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.createAccountButton}
                onPress={() => navigation.navigate('SignUpScreen')}
            >
                <Text style={styles.createAccountButtonText}>Create an Account</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
                style={styles.signInButton}
                onPress={() => navigation.navigate('OnboardingScreen')}
            >
            </TouchableOpacity> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    logo: {
        width: 140, // Adjust the size as per your logo
        height: 140,
        marginBottom: 20,
    },
    headerView: {
        alignItems: 'center',
        width: '85%'
    },
    heading: {
        fontSize: 26,
        letterSpacing: 0.9,
        lineHeight: 40,
        fontWeight: "600",
        textAlign: 'center',
    },
    signInButton: {
        backgroundColor: "#884efe",
        justifyContent: 'center',
        height: 56,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        width: '90%',
        marginTop: 20,
    },
    signInButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: "400",
    },
    createAccountButton: {
        borderWidth: 1,
        borderColor: '#696969',
        borderStyle: 'solid',
        borderRadius: 10,
        justifyContent: 'center',
        height: 56,
        borderRadius: 10,
        alignItems: 'center',
        width: '90%',
    },
    createAccountButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '400',
    },
});

export default SignInUpScreen;
