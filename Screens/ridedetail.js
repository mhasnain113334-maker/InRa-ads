import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import LinearGradient from "react-native-linear-gradient";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import firestore from "@react-native-firebase/firestore";

export default function RideDetails({ route }) {

  const [loading, setLoading] = useState(false);

  const pickup = route?.params?.pickup ?? "Unknown Pickup";
  const destination = route?.params?.destination ?? "Unknown Destination";
  const fare = route?.params?.fare ?? "0";

  const email = route?.params?.email ?? "";
  const passengerUid = route?.params?.passengerUid ?? "";
  const driverUid = route?.params?.driverUid ?? "";

  const userType = route?.params?.userType;
  const isDriver = userType === "driver";

  const openWhatsApp = async () => {

    if (loading) return;

    setLoading(true);

    try {

      if (!email) {
        Alert.alert("Error", "Passenger email missing");
        return;
      }

      const doc = await firestore()
        .collection("Inra")
        .doc(email)
        .get();

      if (!doc.exists) {
        Alert.alert("Error", "Passenger not found");
        return;
      }

      let phone = doc.data()?.phone;

      if (!phone) {
        Alert.alert("Error", "Phone number not found");
        return;
      }

      // ✅ SAFE PHONE CLEANING (IMPORTANT FIX)
      phone = String(phone).replace(/[^\d]/g, "");

      // remove leading 0 → convert to Pakistan format
      if (phone.startsWith("0")) {
        phone = "92" + phone.slice(1);
      }

      // if already local 10-digit fix
      if (phone.length === 10) {
        phone = "92" + phone;
      }

      if (phone.length < 10) {
        Alert.alert("Error", "Invalid phone number");
        return;
      }

      // SAVE RIDE
      await firestore().collection("Rides").add({
        pickup,
        destination,
        fare,
        passengerUid,
        passengerEmail: email,
        phone,
        status: "Confirmed",
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      await firestore().collection("rideHistory").add({
        driverUid,
        passengerUid,
        passengerEmail: email,
        pickup,
        destination,
        fare,
        status: "Confirmed",
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      // COMPLETED RIDE
      await firestore().collection("completedRides").add({
        driverUid,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // NOTIFICATION
      if (passengerUid) {
        await firestore()
          .collection("users")
          .doc(passengerUid)
          .collection("notifications")
          .add({
            title: "Ride Confirmed",
            body: "Driver accepted your ride",
            read: false,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
      }

      const message = `🚗 Ride Confirmed

Pickup: ${pickup}
Destination: ${destination}
Fare: Rs ${fare}`;

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      // ✅ CHECK WHATSAPP EXISTS
      const canOpen = await Linking.canOpenURL(url);

      if (!canOpen) {
        Alert.alert("Error", "WhatsApp is not installed");
        return;
      }

      await Linking.openURL(url);

      Alert.alert("Success", "Ride Confirmed Successfully");

    } catch (error) {
      console.log("WHATSAPP ERROR:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#f7f8fa", "#eef2f3"]}
      style={styles.container}>

      <View style={styles.card}>

        <View style={styles.iconCircle}>
          <FontAwesome name="car" size={34} color="#28A745" />
        </View>

        <Text style={styles.title}>Ride Details</Text>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.value}>{pickup}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Destination</Text>
          <Text style={styles.value}>{destination}</Text>
        </View>

        <View style={styles.fareBox}>
          <Text style={styles.fareTitle}>Total Fare</Text>
          <Text style={styles.fareText}>Rs {fare}</Text>
        </View>

        {isDriver && (
          loading ? (
            <ActivityIndicator size="large" color="#28A745" />
          ) : (
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={openWhatsApp}>

              <FontAwesome name="whatsapp" size={22} color="#fff" />

              <Text style={styles.buttonText}>Open WhatsApp</Text>

            </TouchableOpacity>
          )
        )}

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "#bce6b3",
    borderRadius: 28,
    padding: 25,
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EAF8EE",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },

  infoBox: {
    backgroundColor: "#f8f9fb",
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
  },

  fareBox: {
    backgroundColor: "#28A745",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
  },

  fareTitle: {
    color: "#dfffe5",
    fontSize: 14,
  },

  fareText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  whatsappButton: {
    marginTop: 28,
    backgroundColor: "#25D366",
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
});