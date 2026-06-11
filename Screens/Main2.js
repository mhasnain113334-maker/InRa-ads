import React, {
  useEffect,
  useState,
  useContext,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

import firestore from '@react-native-firebase/firestore';

import messaging from '@react-native-firebase/messaging';

import notifee, {
  AndroidImportance,
  EventType,
} from '@notifee/react-native';

import { ProfileContext } from './ProfileContext';

export default function MainScreen2({
  navigation,
}) {
  const { profile } =
    useContext(ProfileContext);

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [coins, setCoins] =
    useState(0);

  // =========================
  // DRIVER SETUP
  // =========================

  useEffect(() => {
    const startDriverSetup = async () => {
      try {
        await new Promise(resolve =>
          setTimeout(resolve, 2000),
        );

        if (!profile?.uid) {
          console.log(
            'PROFILE STILL NOT READY',
          );
          return;
        }

        console.log(
          'FINAL PROFILE UID:',
          profile.uid,
        );

        await messaging().requestPermission();

        await notifee.requestPermission();

        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance:
            AndroidImportance.HIGH,
        });

        const token =
          await messaging().getToken();

        console.log('FCM TOKEN:', token);

        // SAVE DRIVER
    await firestore()
  .collection('drivers')
  .doc(profile.uid)
  .set(
    {
      role: 'driver',
      fcmToken: token,
      isOnline: true,

      coins: 0,

      rewards: {
        coin5Taps: 0,
        coin5CooldownEnd: null,

        coin8Taps: 0,
        coin8CooldownEnd: null,

        coin10Taps: 0,
        coin10CooldownEnd: null,
      },

      updatedAt:
        firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

        console.log(
          'DRIVER ONLINE SAVED',
        );
      } catch (e) {
        console.log(
          'DRIVER SETUP FAILED:',
          e,
        );
      }
    };

    startDriverSetup();
  }, [profile?.uid]);

  // =========================
  // RECEIVE FCM
  // =========================

  useEffect(() => {
    const unsubscribe =
      messaging().onMessage(
        async remoteMessage => {
          console.log(
            'FCM RECEIVED:',
            remoteMessage,
          );

          await notifee.displayNotification({
            title:
              remoteMessage.notification
                ?.title ||
              'New Ride Request 🚖',

            body:
              remoteMessage.notification
                ?.body ||
              'Passenger Request',

            data: remoteMessage.data,

            android: {
              channelId: 'default',

              importance:
                AndroidImportance.HIGH,

              pressAction: {
                id: 'default',
              },
            },
          });
        },
      );

    return unsubscribe;
  }, []);

  // =========================
  // NOTIFICATION CLICK
  // =========================

  useEffect(() => {
    const unsubscribe =
      notifee.onForegroundEvent(
        ({ type, detail }) => {
          if (
            type === EventType.PRESS
          ) {
            const data =
              detail.notification?.data;

            navigation.navigate(
              'RideDetails',
              data,
            );
          }
        },
      );

    return unsubscribe;
  }, [navigation]);

  // =========================
  // FETCH NOTIFICATIONS
  // =========================

  useEffect(() => {
    if (!profile?.uid) return;

    const unsubscribe = firestore()
      .collection('notifications')
      .doc(profile.uid)
      .collection('items')
      .orderBy(
        'createdAt',
        'desc',
      )
      .onSnapshot(
        snapshot => {
          const list =
            snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));

          setNotifications(list);
        },
        error => {
          console.log(
            'NOTIFICATION ERROR:',
            error,
          );
        },
      );

    return unsubscribe;
  }, [profile?.uid]);

  // =========================
  // UNREAD BADGE
  // =========================

  useEffect(() => {
    if (!profile?.uid) return;

    const unsubscribe = firestore()
      .collection('notifications')
      .doc(profile.uid)
      .collection('items')
      .where('read', '==', false)
      .onSnapshot(
        snapshot => {
          setUnreadCount(
            snapshot.docs.length,
          );
        },
        error => {
          console.log(
            'BADGE ERROR:',
            error,
          );
        },
      );

    return unsubscribe;
  }, [profile?.uid]);
  // =========================
// LOAD COINS
// =========================

useEffect(() => {
  if (!profile?.uid) return;

  const unsubscribe = firestore()
    .collection('drivers')
    .doc(profile.uid)
    .onSnapshot(doc => {
      const data = doc.data();

      if (data) {
        setCoins(data.coins || 0);
      }
    });

  return unsubscribe;
}, [profile?.uid]);

// =========================
// CHECK COOLDOWNS
// =========================

useEffect(() => {
  if (!profile?.uid) return;

  const checkCooldown =
    async () => {
      try {
        const doc =
          await firestore()
            .collection('drivers')
            .doc(profile.uid)
            .get();

        const data = doc.data();

        if (!data?.rewards)
          return;

        const now = Date.now();

        const updates = {};

        if (
          data.rewards.coin5CooldownEnd &&
          now >=
            data.rewards
              .coin5CooldownEnd
        ) {
          updates[
            'rewards.coin5Taps'
          ] = 0;

          updates[
            'rewards.coin5CooldownEnd'
          ] = null;
        }

        if (
          data.rewards.coin8CooldownEnd &&
          now >=
            data.rewards
              .coin8CooldownEnd
        ) {
          updates[
            'rewards.coin8Taps'
          ] = 0;

          updates[
            'rewards.coin8CooldownEnd'
          ] = null;
        }

        if (
          data.rewards.coin10CooldownEnd &&
          now >=
            data.rewards
              .coin10CooldownEnd
        ) {
          updates[
            'rewards.coin10Taps'
          ] = 0;

          updates[
            'rewards.coin10CooldownEnd'
          ] = null;
        }

        if (
          Object.keys(updates)
            .length > 0
        ) {
          await firestore()
            .collection('drivers')
            .doc(profile.uid)
            .update(updates);
        }
      } catch (e) {
        console.log(
          'COOLDOWN ERROR:',
          e,
        );
      }
    };

  checkCooldown();
}, [profile?.uid]);
const handleCoinClick = async (
  rewardKey,
  coinAmount,
) => {
  console.log(
    'COIN CLICKED:',
    rewardKey,
    coinAmount,
  );
  try {
    const driverRef = firestore()
      .collection('drivers')
      .doc(profile.uid);

    const doc =
      await driverRef.get();

    const data = doc.data();

    const rewards =
      data.rewards || {};

    const taps =
      rewards[`${rewardKey}Taps`] || 0;

    const cooldown =
      rewards[
        `${rewardKey}CooldownEnd`
      ];

    const now = Date.now();

    // still on cooldown
    if (
      cooldown &&
      now < cooldown
    ) {
      const mins = Math.ceil(
        (cooldown - now) /
          1000 /
          60,
      );

      alert(
        `Wait ${mins} minutes`,
      );

      return;
    }

    const newTaps = taps + 1;

    const updates = {
      coins:
        (data.coins || 0) +
        coinAmount,
      [`rewards.${rewardKey}Taps`]:
        newTaps,
    };

    // 3 taps reached
    if (newTaps >= 3) {
      updates[
        `rewards.${rewardKey}Taps`
      ] = 0;

      updates[
        `rewards.${rewardKey}CooldownEnd`
      ] =
        Date.now() +
        30 * 60 * 1000; //  30 M
    }

    await driverRef.update(
      updates,
    );
  } catch (e) {
    console.log(
      'COIN ERROR:',
      e,
    );
  }
};
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#F5F7FB"
        barStyle="dark-content"
      />

      {/* HEADER */}
      <View
        style={
          styles.welcomeContainer
        }>
        <View>
          <Text
            style={
              styles.welcomeText
            }>
            Welcome Back 👋
          </Text>

          <Text
            style={styles.nameText}>
            {profile?.name ||
              'Driver'}
          </Text>
        </View>

        <View style={styles.ridesBox}>
          <Image
            source={require('./image/coin_11378397.png')}
            style={styles.headerCoin}
          />

          <Text style={styles.coinText}>
            {coins}
          </Text>
        </View>
      </View>

     {/* COINS */}
<View style={styles.coinsContainer}>
  <View style={styles.coinsRow}>
    <TouchableOpacity
      style={styles.coinCircle}
      onPress={() =>
        handleCoinClick('coin5', 1)
      }>
      <Image
        source={require('./image/coin_11378397.png')}
        style={styles.circleImg}
      />

      <Text style={styles.coinAmount}>
        +1
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.coinCircle}
      onPress={() =>
        handleCoinClick('coin8', 2)
      }>
      <Image
        source={require('./image/coin_11378397.png')}
        style={styles.circleImg}
      />

      <Text style={styles.coinAmount}>
        +2
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.coinCircle}
      onPress={() =>
        handleCoinClick('coin10', 3)
      }>
      <Image
        source={require('./image/coin_11378397.png')}
        style={styles.circleImg}
      />

      <Text style={styles.coinAmount}>
        +3
      </Text>
    </TouchableOpacity>
  </View>

  <Text style={styles.coinsInfoText}>
    Earn coins by watching videos and
    use them for your rides
  </Text>
</View>

      {/* REQUESTS */}
      <View
        style={
          styles.notificationSection
        }>
        <View
          style={
            styles.requestHeader
          }>
          <View>
            <Text
              style={
                styles.requestTitle
              }>
              Ride Requests
            </Text>

            <Text
              style={
                styles.requestSubtitle
              }>
              New customer bookings
            </Text>
          </View>

          <View
            style={
              styles.requestBadge
            }>
            <Text
              style={
                styles.requestBadgeText
              }>
              {
                notifications.length
              }
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }>
          {notifications.map(
            item => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                style={
                  styles.notificationCard
                }
                onPress={() =>
                  navigation.navigate(
                    'RideDetails',
                    {
                      ...item,
                      userType: 'driver',
                    },
                  )
                }>
                <View
                  style={
                    styles.leftIcon
                  }>
                  <FontAwesome
                    name="car"
                    size={22}
                    color="#16A34A"
                  />
                </View>

                <View
                  style={
                    styles.cardCenter
                  }>
                  <Text
                    style={
                      styles.notifTitle
                    }>
                    {item.title}
                  </Text>

                  <Text
                    numberOfLines={2}
                    style={
                      styles.notifBody
                    }>
                    From:{' '}
                    {item.from} →{' '}
                    {
                      item.destination
                    }
                  </Text>

                  <View
                    style={
                      styles.bottomMiniRow
                    }>
                    <View
                      style={
                        styles.liveDot
                      }
                    />

                    <Text
                      style={
                        styles.liveText
                      }>
                      Live Request
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.arrowContainer
                  }>
                  <FontAwesome
                    name="angle-right"
                    size={22}
                    color="#16A34A"
                  />
                </View>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>
      </View>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              'RideHistory',
              {
                userType: 'driver',
              },
            )
          }>
          <FontAwesome
            name="book"
            size={24}
            color="#28A745"
          />

          <Text style={styles.navText}>
            Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={async () => {
            try {
              const snapshot =
                await firestore()
                  .collection(
                    'notifications',
                  )
                  .doc(profile.uid)
                  .collection(
                    'items',
                  )
                  .where(
                    'read',
                    '==',
                    false,
                  )
                  .get();

              const batch =
                firestore().batch();

              snapshot.docs.forEach(
                doc => {
                  batch.update(
                    doc.ref,
                    {
                      read: true,
                    },
                  );
                },
              );

              await batch.commit();

              setUnreadCount(0);
            } catch (e) {
              console.log(
                'READ ERROR:',
                e,
              );
            }

            navigation.navigate(
              'Notifications',
            );
          }}>
          <View>
            <FontAwesome
              name="envelope"
              size={24}
              color="#28A745"
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
          </View>

          <Text style={styles.navText}>
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
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

          <Text style={styles.navText}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#F5F7FB',
  },

  welcomeContainer: {
    marginTop: 20,
    marginHorizontal: 18,
    backgroundColor:
      '#16A34A',
    borderRadius: 28,
    padding: 22,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  welcomeText: {
    color: '#DCFCE7',
    fontSize: 14,
  },

  nameText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 5,
  },

  ridesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
  },

  headerCoin: {
    width: 22,
    height: 22,
    marginRight: 6,
  },

  coinText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },

  coinsContainer: {
    marginTop: 18,
    marginHorizontal: 18,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
  },

  coinsTop: {
    flexDirection: 'row',
    justifyContent:
      'center',
    alignItems: 'center',
    marginBottom: 16,
  },


  coinsRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  coinCircle: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor:
      '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  circleImg: {
    width: 48,
    height: 48,
    marginBottom: 6,
  },

  coinAmount: {
    fontWeight: 'bold',
    color: '#16A34A',
    fontSize: 16,
  },

  coinsInfoText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },

  notificationSection: {
    flex: 1,
    marginTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 90,
  },

  requestHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  requestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },

  requestSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },

  requestBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  requestBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginBottom: 15,
    elevation: 5,
  },

  leftIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor:
      '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  cardCenter: {
    flex: 1,
  },

  notifTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111827',
  },

  notifBody: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 5,
  },

  bottomMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor:
      '#22C55E',
    marginRight: 6,
  },

  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },

  arrowContainer: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor:
      '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent:
      'space-around',
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },

  navItem: {
    alignItems: 'center',
  },

  navText: {
    fontSize: 12,
    marginTop: 3,
  },

  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: 'red',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});