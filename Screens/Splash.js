import React, { useEffect } from "react";
import { Text, StyleSheet, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";

// Firebase
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const { width } = Dimensions.get("window");

const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {

    const unsubscribe = auth().onAuthStateChanged(async (user) => {

      console.log("User:", user);

      // ❌ No user → Login
      if (!user) {
        navigation.replace("Login");
        return;
      }

      try {

        // ✅ CORRECT DOCUMENT
        const doc = await firestore()
          .collection("Inra")
          .doc(user.email) // ✅ FIX HERE
          .get();

        if (doc.exists) {

          const data = doc.data();

          console.log("User Data:", data);

          // ✅ ROLE BASED NAVIGATION
          if (data?.role === "driver") {
            navigation.replace("MainScreen2"); // DRIVER
          } else {
            navigation.replace("MainScreen1"); // PASSENGER
          }

        } else {
          // ❌ No profile yet
          navigation.replace("Login");
        }

      } catch (error) {
        console.log("Firestore error:", error);
        navigation.replace("Login");
      }

    });

    return unsubscribe;

  }, []);

  return (
    <LinearGradient colors={["#00c853", "#64dd40"]} style={styles.container}>
      <Text style={styles.title}>
        <Text style={styles.inra}>InRa</Text>
      </Text>

      <LottieView
        source={require("./Asset/Animation - 1747419185098 (1).json")}
        autoPlay
        loop
        style={styles.lottie}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 48, marginBottom: 50 },
  inra: {
    fontWeight: "bold",
    fontStyle: "italic",
    letterSpacing: 2,
    color: "#ffffff",
    fontFamily: "serif",
  },
  lottie: { width: width * 0.4, height: width * 0.4 },
});

export default Splash;