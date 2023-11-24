import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import colors from '../../assets/colors/colors';
import HomepageSearchBar from '../components/HomepageSearchBar';
import bottomnavigator from '../components/BottomNavigator'

const HomepageScreen = ({navigation}) => {
    return(
        <View>
            <TouchableOpacity onPress = { () => navigation.navigate('AboutUs')}>
                <Image source = {require('../../assets/adaptive-icon-cropped.png')} style = {{
                    width: 60,
                    height: 60,
                    marginTop: 60,
                    marginLeft: 15,
                }}/>
            </TouchableOpacity>
            <Text style = { styles.header }>VolunTrack</Text>
            <Text style = { styles.text }>Track your volunteering hours and explore new volunteering opportunities!</Text>
            <HomepageSearchBar/>
            <StatusBar style = "auto" />
        </View>
    );
}

const styles = StyleSheet.create ({
    header: {
        color: colors.primary,
        fontFamily: 'PingFangSC-Semibold', 
        fontSize: 36, 
        marginVertical: 15,
        textAlign: 'center', 
    }, 
    text: {
        color: colors.textDark, 
        fontFamily: 'PingFangSC-Regular',
        fontSize: 15, 
        marginHorizontal: 60,
        marginBottom: 40, 
        textAlign: 'center'
    }
})

export default HomepageScreen;