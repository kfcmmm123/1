// import React from 'react';
// import { View, Button, StyleSheet, TouchableOpacity, Text } from 'react-native';
// import { withNavigation} from 'react-navigation';

// const CreateButton = ({ title, navigation }) => (
//     <TouchableOpacity
//         onPress = { () => navigation.navigate('Navigator')}
//         style = {styles.buttonContainer}
//     >
//         <Text style={styles.buttonText}> {title} </Text>
//     </TouchableOpacity>
// );

// const styles = StyleSheet.create({
//     buttonContainer: {
//         elevation: 8,
//         backgroundColor: "#C9D6DF",
//         borderRadius: 10,
//         paddingVertical: 0,
//         paddingHorizontal: 0,
//         alignSelf: 'center',
//         marginVertical: 10
//     },

//     buttonText: {
//         fontSize: 15,
//         color: "#000000",
//         marginVertical: 10,
//         marginHorizontal: 30,
//         alignSelf: "center",
//         fontFamily: "HelveticaNeue",
//     }
// });

// export default withNavigation(CreateButton);