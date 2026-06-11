import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const RideHistory = ({ route }) => {
  const navigation = useNavigation();

  const [rides, setRides] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const user = auth().currentUser;

    if (!user?.uid) {
      setInitialLoading(false);
      return;
    }



    const unsubscribe = firestore()
      .collection("rideHistory")
      .onSnapshot(
        snapshot => {
          console.log(
            "Total docs:",
            snapshot.docs.length,
          );

          const data = [];

          snapshot.forEach(doc => {
            console.log(doc.id, doc.data());

            data.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          console.log("Ride Data:", JSON.stringify(data));
          setRides(data);
          setInitialLoading(false);
        },
        error => {
          console.log(
            "FIRESTORE ERROR:",
            error,
          );
          setInitialLoading(false);
        },
      );
    return () => unsubscribe();
  }, [route]);

  const getDate = time => {
    if (time?.toDate) {
      return time.toDate().toDateString();
    }
    return "Processing...";
  };

  const renderItem = ({ item, index }) => (
    <View
      style={[
        styles.card,
        { marginTop: index === 0 ? 4 : 12 },
      ]}
    >
      {/* TOP */}
      <View style={styles.rowBetween}>
        <Text style={styles.date}>
          {getDate(item.createdAt)}
        </Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusText}>
            {item.status || "Confirmed"}
          </Text>
        </View>
      </View>

      {/* ROUTE */}
      <View style={styles.routeRow}>
        <View style={styles.placeBox}>
          <Text style={styles.label}>PICKUP</Text>
          <Text style={styles.place}>{item.pickup}</Text>
        </View>

        <View style={styles.iconCircle}>
          <Icon name="car" size={18} color="#fff" />
        </View>

        <View style={styles.placeBox}>
          <Text style={styles.label}>DROP</Text>
          <Text style={styles.place}>{item.destination}</Text>
        </View>
      </View>

      {/* BOTTOM */}
      <View style={styles.bottomRow}>
        <Text style={styles.fareText}>Rs {item.fare}</Text>
        <Icon name="check-circle" size={22} color="#28A745" />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#28A745" }}>
      <StatusBar backgroundColor="#28A745" barStyle="light-content" />

      <LinearGradient colors={["#28A745", "#34c759"]} style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={22} color="#28A745" />
          </TouchableOpacity>

          <Text style={styles.title}>Ride History</Text>
        </View>

        {/* BODY */}
        <View style={styles.body}>
          {initialLoading ? (
            // ONLY FIRST LOAD LOADER (NO FLICKER)
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#28A745" />
            </View>
          ) : rides.length === 0 ? (
            // EMPTY STATE
            <View style={styles.center}>
              <Icon name="history" size={60} color="#28A745" />
              <Text style={styles.empty}>No Ride History</Text>
            </View>
          ) : (
            // DATA LIST
            <FlatList
              data={rides}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 14,
                paddingBottom: 30,
              }}
            />
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginLeft: 15,
  },

  body: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    marginTop: 15,
    fontSize: 18,
    color: "#28A745",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#f4fff6",
    borderRadius: 18,
    padding: 16,
    elevation: 4,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  date: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
  },

  statusBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#dff7e5",
  },

  statusText: {
    color: "#28A745",
    fontWeight: "700",
    fontSize: 12,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },

  placeBox: {
    flex: 1,
  },

  label: {
    color: "#28A745",
    fontSize: 11,
    fontWeight: "800",
  },

  place: {
    color: "#111",
    fontSize: 16,
    marginTop: 4,
    fontWeight: "700",
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#28A745",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },

  bottomRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  fareText: {
    fontSize: 22,
    color: "#28A745",
    fontWeight: "800",
  },
});

export default RideHistory;