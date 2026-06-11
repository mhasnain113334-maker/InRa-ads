import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert
} from 'react-native';

import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // ✅ ADDED

import { ProfileContext } from './ProfileContext';

const PassengerProfile = ({ navigation }) => {

  const { profile, setProfile } = useContext(ProfileContext);

  const [imageUri, setImageUri] = useState(profile?.imageUri || null);
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [cnic, setCnic] = useState(profile?.cnic || '');
  const [gender, setGender] = useState(profile?.gender || '');

  /* ---------------- PICK IMAGE ---------------- */
  const pickAvatarImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: false },
      resp => {
        if (!resp.didCancel && !resp.errorCode && resp.assets?.length) {
          setImageUri(resp.assets[0].uri);
        }
      }
    );
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSave = async () => {
    try {

      const user = auth().currentUser; // ✅ FIXED
      const email = user?.email;

      if (!email) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      if (!name || !phone || !cnic || !gender) {
        Alert.alert("Error", "Fill all fields");
        return;
      }

      // ✅ SAME STRUCTURE AS DRIVER
      const safeProfile = {
        name,
        phone,
        cnic,
        gender,
        imageUri: imageUri || "",
        role: "passenger", // ✅ VERY IMPORTANT
        photoFolder: profile?.photoFolder || []
      };

      await firestore()
        .collection("Inra")
        .doc(email) // ✅ SAME DOC AS DRIVER
        .set(safeProfile, { merge: true });

      // ✅ UPDATE CONTEXT
      setProfile({
        ...(profile || {}),
        ...safeProfile
      });

      Alert.alert("Success", "Profile saved successfully");

      navigation.navigate('MainScreen1');

    } catch (error) {
      console.log("PASSENGER SAVE ERROR:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <LinearGradient colors={['#153815', '#006400']} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

        <View style={styles.bannerArea}>
          <Text style={styles.bannerText}>Your App Banner</Text>
        </View>

        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={pickAvatarImage}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="CNIC"
            value={cnic}
            onChangeText={setCnic}
            keyboardType="numeric"
          />

          <Text style={styles.genderLabel}>Select Gender</Text>

          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'Male' && styles.genderSelected
              ]}
              onPress={() => setGender('Male')}
            >
              <Text style={styles.genderText}>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'Female' && styles.genderSelected
              ]}
              onPress={() => setGender('Female')}
            >
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.animationWrapper}>
          <LottieView
            source={require('./Asset/Animation - 1747419185098 (1).json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bannerArea: {
    height: 180,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  avatarWrapper: {
    position: 'absolute',
    top: 130,
    left: 20,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  infoSection: {
    marginTop: 70,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: '#fff',
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  genderLabel: {
    color: '#fff',
    marginBottom: 6,
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  genderOption: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  genderSelected: {
    backgroundColor: '#0066cc',
  },
  genderText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  animationWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  lottie: {
    width: 150,
    height: 150,
  }
});

export default PassengerProfile;