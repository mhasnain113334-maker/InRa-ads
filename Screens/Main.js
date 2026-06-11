import React, {
  useLayoutEffect,
  useState,
  useEffect,
} from 'react';

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Image,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

import LinearGradient from 'react-native-linear-gradient';

import notifee, {
  EventType,
  AndroidImportance,
} from '@notifee/react-native';

import firestore from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window');

export default function MainScreen1({
  navigation,
}) {
  const [modalVisible, setModalVisible] =
    useState(false);

  const [type, setType] = useState('');

  const [from, setFrom] = useState('');

  const [destination, setDestination] =
    useState('');

  const [fare, setFare] = useState('');

  const [item, setItem] = useState('');

  const [quantity, setQuantity] =
    useState('');

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [coins, setCoins] = useState(0);
  const currentUser = auth().currentUser;
  const [rewardData, setRewardData] = useState({
    coin5Taps: 0,
    coin5CooldownEnd: null,

    coin8Taps: 0,
    coin8CooldownEnd: null,

    coin10Taps: 0,
    coin10CooldownEnd: null,
  });

  const [freeSubmissions, setFreeSubmissions] =
    useState(3);

  // =========================
  // HIDE HEADER
  // =========================
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // =========================
  // CREATE CHANNEL
  // =========================
  useEffect(() => {
    async function createChannel() {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance:
          AndroidImportance.HIGH,
      });
    }

    createChannel();
  }, []);

  // =========================
  // FOREGROUND NOTIFICATION
  // =========================
  useEffect(() => {
    const unsubscribe =
      notifee.onForegroundEvent(
        async ({
          type,
          detail,
        }) => {
          if (
            type ===
            EventType.PRESS
          ) {
            navigation.navigate(
              'Notifications',
            );
          }

          if (
            type ===
            EventType.DISMISSED
          ) {
            console.log(
              'Notification dismissed',
            );
          }
        },
      );

    return unsubscribe;
  }, [navigation]);

  // =========================
  // UNREAD COUNT
  // =========================
  // =========================
  // UNREAD COUNT (FIXED)
  // =========================
  useEffect(() => {
    let unsubscribeFirestore;

    const unsubscribeAuth = auth().onAuthStateChanged(user => {
      if (!user?.uid) return;

      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }

      unsubscribeFirestore = firestore()
        .collection('rideRequests')
        .where('status', '==', 'pending')
        .where('senderRole', '==', 'driver')
        .where('targetRole', '==', 'passenger')
        .where('passengerUid', '==', user.uid)
        .onSnapshot(snapshot => {
          setUnreadCount(snapshot.size || 0);
        });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = firestore()
      .collection('passengers')
      .doc(currentUser.uid)
      .onSnapshot(doc => {
        const data = doc.data();

        if (data) {
          setCoins(data.coins || 0);

          setRewardData(
            data.rewards || {
              coin5Taps: 0,
              coin5CooldownEnd: null,

              coin8Taps: 0,
              coin8CooldownEnd: null,

              coin10Taps: 0,
              coin10CooldownEnd: null,
            },
          );
        }
      });

    return unsubscribe;
  }, []);

  const handleCoinClick = async (
    rewardKey,
    coinAmount,
  ) => {
    try {
      const user = auth().currentUser;

      if (!user) return;

      const ref = firestore()
        .collection('passengers')
        .doc(user.uid);

      const doc = await ref.get();

      let data = doc.data();

      // first time create document
      if (!data) {
        data = {
          coins: 0,
          rewards: {
            coin5Taps: 0,
            coin5CooldownEnd: null,

            coin8Taps: 0,
            coin8CooldownEnd: null,

            coin10Taps: 0,
            coin10CooldownEnd: null,
          },
        };

        await ref.set(data);
      }

      const rewards = data.rewards;

      const taps =
        rewards[`${rewardKey}Taps`] || 0;

      const cooldown =
        rewards[`${rewardKey}CooldownEnd`];

      const now = Date.now();

      if (cooldown && now < cooldown) {
        const mins = Math.ceil(
          (cooldown - now) / 1000 / 60,
        );

        Alert.alert(
          'Wait',
          `${mins} minutes remaining`,
        );

        return;
      }

      const newTaps = taps + 1;

      const updates = {
        coins:
          (data.coins || 0) + coinAmount,

        [`rewards.${rewardKey}Taps`]:
          newTaps,
      };

      if (newTaps >= 3) {
        updates[
          `rewards.${rewardKey}Taps`
        ] = 0;

        updates[
          `rewards.${rewardKey}CooldownEnd`
        ] =
          Date.now() + 30 * 60 * 1000;
      }

      await ref.update(updates);
    } catch (e) {
      console.log('COIN ERROR:', e);
    }
  };

  // =========================
  // SUBMIT REQUEST
  // =========================
  const handleSubmit = async () => {
    const currentUser = auth().currentUser;

    const email = currentUser?.email || '';
    const passengerUid = currentUser?.uid || '';

    if (!from || !destination) {
      Alert.alert(
        'Error',
        'Please fill all fields',
      );
      return;
    }

    if (
      type === 'Booking' &&
      !fare
    ) {
      Alert.alert(
        'Error',
        'Please enter fare',
      );

      return;
    }

    if (
      type === 'Food' &&
      (!item || !quantity)
    ) {
      Alert.alert(
        'Error',
        'Please fill food details',
      );

      return;
    }

    if (
      freeSubmissions <= 0 &&
      coins < 5
    ) {
      Alert.alert(
        'Insufficient Coins',
        'You need 5 coins',
      );

      return;
    }

    try {
      const requestData = {
        title:
          type === 'Booking'
            ? 'New Ride Request 🚖'
            : 'Food Delivery 🍔',

        body: `From ${from} → ${destination}`,

        type,

        from,

        destination,

        fare:
          type === 'Booking'
            ? fare
            : '',

        item:
          type === 'Food'
            ? item
            : '',

        quantity:
          type === 'Food'
            ? quantity
            : '',
        email,
        passengerUid,

        status: 'pending',

        senderRole:
          'passenger',

        targetRole:
          'driver',

        read: false,

        createdAt:
          firestore.FieldValue.serverTimestamp(),
      };

      // SAVE REQUEST
      const docRef =
        await firestore()
          .collection(
            'rideRequests',
          )
          .add(requestData);

      console.log(
        'REQUEST SAVED:',
        docRef.id,
      );

      // SEND TO SERVER
      const response = await fetch(
        'https://ride-server-1wj9.onrender.com/send-to-drivers',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            requestId:
              docRef.id,

            title:
              requestData.title,

            body:
              requestData.body,

            type,

            from,

            destination,

            fare,

            item,

            quantity,

            senderRole:
              'passenger',

            targetRole:
              'driver',
            email,
            passengerUid,
          }),
        },
      );

      let result = {};

      try {
        result =
          await response.json();
      } catch (e) {
        console.log(
          'JSON ERROR:',
          e,
        );
      }

      console.log(
        'SERVER RESPONSE:',
        result,
      );

      if (!response.ok) {
        Alert.alert(
          'Server Error',
          result?.error ||
          'Failed to notify drivers',
        );

        return;
      }

      // LOCAL SUCCESS NOTIFICATION

      // UPDATE COINS
      if (
        freeSubmissions > 0
      ) {
        setFreeSubmissions(
          prev => prev - 1,
        );
      } else {
        if (freeSubmissions > 0) {
          setFreeSubmissions(prev => prev - 1);
        } else {
          await firestore()
            .collection('passengers')
            .doc(currentUser.uid)
            .update({
              coins: firestore.FieldValue.increment(-5),
            });
        }
      }

      // RESET FORM
      setFrom('');

      setDestination('');

      setFare('');

      setItem('');

      setQuantity('');

      setModalVisible(false);

      Alert.alert(
        'Success 🚖',
        'Drivers notified successfully',
      );

    } catch (error) {
      console.log(
        'SUBMIT ERROR:',
        error,
      );

      Alert.alert(
        'Error',
        error?.message ||
        'Something went wrong',
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() =>
            navigation.openDrawer()
          }>
          <FontAwesome
            name="bars"
            size={24}
            color="#28A745"
          />
        </TouchableOpacity>

        <View style={styles.coinsBox}>
          <Image
            source={require('./image/coin_11378397.png')}
            style={styles.coinIcon}
          />

          <Text
            style={
              styles.coinsText
            }>
            {coins}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }>
        {/* HEADER */}
        <View style={styles.header}>
          <Text
            style={
              styles.headerText
            }>
            Choose Your Services
          </Text>
        </View>

        {/* CARDS */}
        <View
          style={
            styles.topContainer
          }>
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              setType(
                'Booking',
              );

              setModalVisible(
                true,
              );
            }}>
            <Image
              source={require('./image/rm.png')}
              style={
                styles.cardImage
              }
            />

            <Text
              style={
                styles.cardText
              }>
              Booking
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              setType('Food');

              setModalVisible(
                true,
              );
            }}>
            <Image
              source={require('./image/mae-mu-I7A_pHLcQK8-unsplash.jpg')}
              style={
                styles.cardImage
              }
            />

            <Text
              style={
                styles.cardText
              }>
              Food
            </Text>
          </TouchableOpacity>
        </View>

        {/* COINS */}
        <View
          style={
            styles.coinsContainer
          }>
          <View style={styles.coinsRow}>
            <TouchableOpacity
              style={
                styles.coinCircle
              }
              onPress={() =>
                handleCoinClick('coin5', 1)
              }>
              <Image
                source={require('./image/coin_11378397.png')}
                style={
                  styles.circleImg
                }
              />

              <Text
                style={
                  styles.coinAmount
                }>
                {
                  rewardData.coin5CooldownEnd &&
                    Date.now() < rewardData.coin5CooldownEnd
                    ? `${Math.ceil(
                      (rewardData.coin5CooldownEnd - Date.now()) /
                      1000 /
                      60
                    )}m`
                    : '+1'
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.coinCircle
              }
              onPress={() =>
                handleCoinClick('coin8', 2)
              }>
              <Image
                source={require('./image/coin_11378397.png')}
                style={
                  styles.circleImg
                }
              />

              <Text
                style={
                  styles.coinAmount
                }>
                {
                  rewardData.coin8CooldownEnd &&
                    Date.now() < rewardData.coin8CooldownEnd
                    ? `${Math.ceil(
                      (rewardData.coin8CooldownEnd - Date.now()) /
                      1000 /
                      60
                    )}m`
                    : '+2'
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.coinCircle
              }
              onPress={() =>
                handleCoinClick('coin10', 3)
              }>
              <Image
                source={require('./image/coin_11378397.png')}
                style={
                  styles.circleImg
                }
              />

              <Text
                style={
                  styles.coinAmount
                }>
                {
                  rewardData.coin10CooldownEnd &&
                    Date.now() < rewardData.coin10CooldownEnd
                    ? `${Math.ceil(
                      (rewardData.coin10CooldownEnd - Date.now()) /
                      1000 /
                      60
                    )}m`
                    : '+3'
                }
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={
              styles.coinsInfoText
            }>
            Earn coins by watching videos and
            use them for your rides and Orders
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              'RideHistory',
              {
                userType: 'passanger',
              },
            )
          }>
          <FontAwesome
            name="book"
            size={24}
            color="#28A745"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.centerIcon
          }
          onPress={async () => {
            setUnreadCount(0);

            try {
              const currentUser = auth().currentUser;

              const snapshot = await firestore()
                .collection('rideRequests')
                .where('senderRole', '==', 'driver')
                .where('targetRole', '==', 'passenger')
                .where('status', '==', 'pending')
                .where(
                  'passengerUid',
                  '==',
                  currentUser?.uid,
                )
                .get();

              const batch = firestore().batch();

              snapshot.docs.forEach(doc => {
                batch.update(doc.ref, {
                  status: 'read',
                });
              });

              await batch.commit();
            } catch (e) {
              console.log('READ ERROR:', e);
            }

            navigation.navigate('Notifications');

          }}>
          <FontAwesome
            name="envelope"
            size={22}
            color="#fff"
          />

          {unreadCount >
            0 && (
              <View
                style={
                  styles.badge
                }>
                <Text
                  style={
                    styles.badgeText
                  }>
                  {
                    unreadCount
                  }
                </Text>
              </View>
            )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              'Propa',
            )
          }>
          <FontAwesome
            name="user"
            size={24}
            color="#28A745"
          />
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide">
        <LinearGradient
          colors={[
            '#28A745',
            '#5CD65C',
          ]}
          style={{ flex: 1 }}>
          <View
            style={
              styles.modalContainer
            }>
            <Text
              style={
                styles.modalTitle
              }>
              {type} Request
            </Text>

            <View
              style={
                styles.formCard
              }>
              <TextInput
                placeholder="From"
                value={from}
                onChangeText={
                  setFrom
                }
                style={
                  styles.input
                }
              />

              <TextInput
                placeholder="Destination"
                value={
                  destination
                }
                onChangeText={
                  setDestination
                }
                style={
                  styles.input
                }
              />

              {type ===
                'Booking' && (
                  <TextInput
                    placeholder="Enter Fare"
                    value={fare}
                    onChangeText={
                      setFare
                    }
                    style={
                      styles.input
                    }
                    keyboardType="numeric"
                  />
                )}

              {type ===
                'Food' && (
                  <>
                    <TextInput
                      placeholder="Item"
                      value={item}
                      onChangeText={
                        setItem
                      }
                      style={
                        styles.input
                      }
                    />

                    <TextInput
                      placeholder="Quantity"
                      value={
                        quantity
                      }
                      onChangeText={
                        setQuantity
                      }
                      style={
                        styles.input
                      }
                      keyboardType="numeric"
                    />
                  </>
                )}

              <TouchableOpacity
                style={
                  styles.submitBtn
                }
                onPress={
                  handleSubmit
                }>
                <Text
                  style={
                    styles.submitText
                  }>
                  Submit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.cancelBtn
                }
                onPress={() =>
                  setModalVisible(
                    false,
                  )
                }>
                <Text
                  style={
                    styles.cancelText
                  }>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#fafafa',
    paddingHorizontal: 18,
  },

  topBar: {
    position: 'absolute',
    top: 10,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    zIndex: 10,
  },

  coinsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    elevation: 4,
  },

  coinIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },

  coinsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28A745',
  },

  header: {
    marginTop: 80,
    alignItems: 'center',
  },

  headerText: {
    fontSize: 26,
    color: '#28A745',
    fontWeight: 'bold',
  },

  topContainer: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    marginTop: 60,
  },

  card: {
    width:
      (width - 60) / 2,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor:
      '#ddd',
  },

  cardImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'cover',
  },

  cardText: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    textAlign: 'center',
    paddingVertical: 6,
    fontWeight: 'bold',
    backgroundColor:
      '#3cb14c',
    color: '#fff',
  },

  coinsContainer: {
    marginTop: 30,
    marginBottom: 100,
    backgroundColor:
      '#ffffff',
    borderRadius: 20,
    padding: 15,
    elevation: 5,
  },

  coinsRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  coinCircle: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor:
      '#9ef89b',
    justifyContent: 'center',
    alignItems: 'center',
  },

  circleImg: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },

  coinAmount: {
    fontWeight: 'bold',
    color: '#28A745',
  },

  coinsInfoText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent:
      'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },

  centerIcon: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor:
      '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  modalTitle: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },

  input: {
    backgroundColor:
      '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  submitBtn: {
    backgroundColor:
      '#28A745',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  cancelBtn: {
    backgroundColor: 'red',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});