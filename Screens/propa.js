import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from "react-native";
import LottieView from "lottie-react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import Modal from "react-native-modal";
import ImageViewer from "react-native-image-zoom-viewer";
import { useNavigation } from "@react-navigation/native";

import { ProfileContext } from "./ProfileContext";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const Propa = () => {
  const navigation = useNavigation();
  const { profile, setProfile } = useContext(ProfileContext);

  const [avatarZoomVisible, setAvatarZoomVisible] = useState(false);

  const {
    name,
    phone,
    cnic,
    gender,
    imageUri,
    role,
    license,
    vehicleType,
  } = profile || {};

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth().currentUser;

        if (!user?.email) return;

        const doc = await firestore()
          .collection("Inra")
          .doc(user.email)
          .get();

        if (doc.exists) {
          setProfile(doc.data());
        }
      } catch (error) {
        console.log("Profile Error:", error);
      }
    };

    fetchProfile();
  }, [setProfile]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#28A745" barStyle="light-content" />
      <Modal
        isVisible={avatarZoomVisible}
        style={{ margin: 0 }}
        onBackButtonPress={() => setAvatarZoomVisible(false)}
        onBackdropPress={() => setAvatarZoomVisible(false)}
      >
        <ImageViewer
          imageUrls={[
            {
              url: imageUri,
            },
          ]}
          enableSwipeDown={true}
          onSwipeDown={() => setAvatarZoomVisible(false)}
          backgroundColor="black"
          renderIndicator={() => null}
        />
      </Modal>

      <LinearGradient colors={["#28A745", "#34c759"]} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          <View style={styles.card}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={20} color="#28A745" />
            </TouchableOpacity>

            {/* Profile Photo */}
            <TouchableOpacity
              style={styles.photoBox}
              onPress={() => imageUri && setAvatarZoomVisible(true)}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.photo} />
              ) : (
                <View style={styles.emptyPhoto}>
                  <Icon name="user" size={55} color="#28A745" />
                  <Text style={styles.emptyText}>Profile Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Details */}
            <View style={styles.contentRow}>
              <View style={styles.leftSide}>
                <Field label="Name" value={name} />
                <Field label="Phone" value={phone} />
                <Field label="CNIC" value={cnic} />
                <Field label="Gender" value={gender} />

                {role === "driver" && (
                  <>
                    <Field label="License" value={license} />
                    <Field label="Vehicle" value={vehicleType} />
                  </>
                )}
              </View>

              <View style={styles.logoBox}>
                <LottieView
                  source={require("./Asset/Animation - 1747419185098 (1).json")}
                  autoPlay
                  loop
                  style={{ width: 80, height: 80 }}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const Field = ({ label, value }) => (
  <View style={styles.fieldBox}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>
      {value || "-"}
    </Text>
  </View>
);

export default Propa;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#28A745",
  },

  flex: {
    flex: 1,
  },

  container: {
    padding: 12,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 5,
  },

  backBtn: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 99,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e9f8ed",
    justifyContent: "center",
    alignItems: "center",
  },

  photoBox: {
    height: 250,
    width: "100%",
  },

  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  emptyPhoto: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4fff6",
  },

  emptyText: {
    marginTop: 10,
    color: "#28A745",
    fontWeight: "700",
    fontSize: 16,
  },

  contentRow: {
    flexDirection: "row",
    padding: 10,
  },

  leftSide: {
    flex: 1,
    marginRight: 10,
  },

  fieldBox: {
    backgroundColor: "#e9f8ed",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },

  fieldLabel: {
    fontSize: 11,
    color: "#28A745",
    fontWeight: "700",
  },

  fieldValue: {
    marginTop: 4,
    color: "#222",
    fontWeight: "600",
  },

  logoBox: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  logoText: {
    marginTop: 6,
    color: "#28A745",
    fontWeight: "700",
  },

  villageArea: {
    height: 180,
    margin: 10,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#e9f8ed",
  },

  villageImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  modalBg: {
    flex: 1,
    backgroundColor: "#000",
  },

  modalBack: {
    position: "absolute",
    top: 45,
    left: 20,
    zIndex: 999,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});