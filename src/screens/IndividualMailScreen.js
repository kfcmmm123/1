import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import colors from '../../assets/colors/colors';

const IndividualMailScreen = () => {
    return(
        <View style = {styles.container}>
            <Text style = {{ color: colors.textDark }}>Individual Mail</Text>
            <StatusBar style = "auto" />
        </View>
    );
}

const styles = StyleSheet.create ({
    container: {
        flex: 1, 
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    }, 
})

export default IndividualMailScreen; 