import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, ScrollView, Alert, Platform
} from 'react-native';

import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

import { ProfileContext } from './ProfileContext';

const DriverProfile = ({ navigation }) => {

  const { profile, setProfile } = useContext(ProfileContext);

  const [imageUri, setImageUri] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cnic, setCnic] = useState('');
  const [license, setLicense] = useState('');
  const [gender, setGender] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');

  const vehicleOptions = ['Car', 'Bike', 'Auto'];

  /* ---------------- PICK IMAGE ---------------- */
  const pickAvatarImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, res => {
      if (!res.didCancel && res.assets?.length) {
        setImageUri(res.assets[0].uri);
      }
    });
  };

  /* ---------------- FETCH PROFILE ---------------- */
  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        const user = auth().currentUser;
        if (!user?.email) return;

        const doc = await firestore()
          .collection("Inra")
          .doc(user.email)
          .get();

        if (doc.exists) {
          const data = doc.data();

          setImageUri(data.imageUri || null);
          setName(data.name || "");
          setPhone(data.phone || "");
          setCnic(data.cnic || "");
          setLicense(data.license || "");
          setGender(data.gender || "");
          setVehicleType(data.vehicleType || "Car");

          // ✅ ALSO UPDATE CONTEXT
          setProfile({
            ...(profile || {}),
            ...data
          });
        }
      } catch (e) {
        console.log("FETCH ERROR:", e);
      }
    };

    fetchDriverProfile();
  }, []);

  /* ---------------- SAVE FCM TOKEN ---------------- */
  const saveFcmToken = async (uid) => {
    try {
      if (Platform.OS === "android") {
        await messaging().requestPermission();
      }

      const token = await messaging().getToken();

      await firestore()
        .collection("drivers")
        .doc(uid)
        .set(
          {
            fcmToken: token,
            role: "driver",
            updatedAt: firestore.FieldValue.serverTimestamp()
          },
          { merge: true }
        );

      messaging().onTokenRefresh(async (newToken) => {
        await firestore()
          .collection("drivers")
          .doc(uid)
          .set(
            {
              fcmToken: newToken,
              role: "driver",
              updatedAt: firestore.FieldValue.serverTimestamp()
            },
            { merge: true }
          );
      });

    } catch (error) {
      console.log("FCM ERROR:", error);
    }
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSave = async () => {

    if (!name || !phone || !cnic || !license || !gender) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }

    try {
      const user = auth().currentUser;
      if (!user?.email) return;

      const uid = user.uid;

      const safeProfile = {
        name,
        phone,
        cnic,
        license,
        gender,
        vehicleType,
        imageUri: imageUri || "",
        photoFolder: profile?.photoFolder || [] // ✅ important
      };

      await firestore()
        .collection("Inra")
        .doc(user.email)
        .set(
          {
            ...safeProfile,
            role: "driver",
            uid: uid
          },
          { merge: true }
        );

      await saveFcmToken(uid);

      // ✅ UPDATE CONTEXT
      setProfile({
        ...(profile || {}),
        role: 'driver',
        ...safeProfile
      });

      Alert.alert("Success", "Profile Saved");
      navigation.navigate("MainScreen2");

    } catch (e) {
      console.log("SAVE ERROR:", e);
      Alert.alert("Error", "Failed to save");
    }
  };

  return (
    <LinearGradient colors={['#32CD32', '#006400']} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickAvatarImage}>
            {imageUri ?
              <Image source={{ uri: imageUri }} style={styles.avatar} /> :
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text>Add Photo</Text>
              </View>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName}/>
          <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone}/>
          <TextInput style={styles.input} placeholder="CNIC" value={cnic} onChangeText={setCnic}/>
          <TextInput style={styles.input} placeholder="License" value={license} onChangeText={setLicense}/>

          <Text style={styles.genderLabel}>Gender</Text>
          <View style={styles.genderContainer}>
            {['Male','Female'].map(g=>(
              <TouchableOpacity key={g}
                style={[styles.genderOption, gender===g && styles.genderSelected]}
                onPress={()=>setGender(g)}>
                <Text>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.genderLabel}>Vehicle</Text>
          <View style={styles.genderContainer}>
            {vehicleOptions.map(v=>(
              <TouchableOpacity key={v}
                style={[styles.genderOption, vehicleType===v && styles.genderSelected]}
                onPress={()=>setVehicleType(v)}>
                <Text>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container:{flex:1},
  avatarContainer:{alignItems:'center',marginTop:30},
  avatar:{width:110,height:110,borderRadius:60,backgroundColor:'#ccc'},
  avatarPlaceholder:{justifyContent:'center',alignItems:'center'},
  infoSection:{padding:20},
  input:{backgroundColor:'#fff',marginBottom:10,padding:10,borderRadius:8},
  genderLabel:{color:'#fff',marginTop:10},
  genderContainer:{flexDirection:'row'},
  genderOption:{flex:1,padding:10,backgroundColor:'#fff',margin:5},
  genderSelected:{backgroundColor:'#0066cc'},
  saveButton:{backgroundColor:'#0066cc',padding:15,marginTop:10},
  saveButtonText:{color:'#fff',textAlign:'center'}
});

export default DriverProfile;