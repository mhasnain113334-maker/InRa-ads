import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Detail = ({ navigation }) => {
  return (
    <LinearGradient colors={['#00c853', '#64dd40']} style={styles.container}>
      <Text style={styles.title}>Select Your Role</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('PassengerProfile')}
      >
        <Text style={styles.buttonText}>Passenger</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('DriverProfile')}
      >
        <Text style={styles.buttonText}>Driver</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 50,
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#00c853',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Detail;
