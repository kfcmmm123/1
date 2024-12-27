import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import colors from '../../assets/colors/colors';

const AboutUsScreen = () => {
    return(
        // Made 'About Us' Screen Scrollable
        <ScrollView> 
            <View style = {styles.container}>
                <Text style = { styles.headerMain }>About Us</Text>
                <StatusBar style = "auto" />
                <Image source = {require('../../assets/adaptive-icon-cropped.png')} style = { styles.logo }/>
                <Text style = { styles.headerSub }>VolunTrack</Text>
                <Text style = { styles.text }>We are a non-profitable organization with a vision to allow high-school students to reach their potential when it comes to gaining experience and acquiring the skills and knowledge they need</Text>
                <Image source = {require('../../assets/images/naassom-azevedo-Q_Sei-TqSlc-unsplash.png')} style = { styles.image }/>
            </View>
        </ScrollView>
        // Made 'About Us' Screen Scrollable
    );
}

const styles = StyleSheet.create ({
    container: {
        flex: 1, 
        backgroundColor: colors.background,
        alignItems: 'center',
    },

    headerMain: {
        color: colors.primary,
        fontFamily: 'PingFangSC-Semibold', 
        fontSize: 36, 
        marginTop: 80,
    }, 

    logo: {
        width: 240,
        height: 240,
    },

    headerSub: {
        color: colors.primary,
        fontFamily: 'PingFangSC-Semibold', 
        fontSize: 36, 
    }, 
    
    text: {
        textAlign: 'center',
        color: colors.textPrimary, 
        fontFamily: 'PingFangSC-Regular',
        fontSize: 15,
        marginVertical: 30, 
        marginHorizontal: 40,
    }, 
    
    image: {
        width: 303,
        height: 240,
        marginBottom: 40
    },


    
})

export default AboutUsScreen; 