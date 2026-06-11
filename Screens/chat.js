import React, {
  useEffect,
  useState,
  useContext,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

import firestore from '@react-native-firebase/firestore';

import { ProfileContext } from './ProfileContext';

export default function Notifications({
  navigation,
}) {

  const { profile } =
    useContext(ProfileContext);

  const [notifications, setNotifications] =
    useState([]);

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

          console.log(
            'NOTIFICATIONS:',
            list,
          );

          setNotifications(list);

        },
        error => {

          console.log(
            'SNAPSHOT ERROR:',
            error,
          );

        },
      );

    return unsubscribe;

  }, [profile?.uid]);

  // =========================
  // MARK AS READ
  // =========================
  useEffect(() => {

    if (!profile?.uid) return;

    const markAsRead = async () => {

      try {

        const snapshot =
          await firestore()
            .collection('notifications')
            .doc(profile.uid)
            .collection('items')
            .where(
              'read',
              '==',
              false,
            )
            .get();

        const batch =
          firestore().batch();

        snapshot.docs.forEach(doc => {

          batch.update(
            doc.ref,
            {
              read: true,
            },
          );

        });

        await batch.commit();

      } catch (e) {

        console.log(
          'MARK READ ERROR:',
          e,
        );

      }

    };

    markAsRead();

  }, [profile?.uid]);

  // =========================
  // DELETE
  // =========================
  const handleDelete = id => {

    Alert.alert(
      'Delete Notification',
      'Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',

          onPress: async () => {

            try {

              await firestore()
                .collection(
                  'notifications',
                )
                .doc(profile.uid)
                .collection('items')
                .doc(id)
                .delete();

            } catch (e) {

              console.log(
                'DELETE ERROR:',
                e,
              );

            }

          },
        },
      ],
    );

  };

  // =========================
  // EMPTY STATE
  // =========================
  if (
    notifications.length === 0
  ) {

    return (

      <View
        style={
          styles.emptyContainer
        }>

        <FontAwesome
          name="bell-slash"
          size={60}
          color="#d6d6d6"
        />

        <Text
          style={
            styles.emptyText
          }>
          No Notifications Yet
        </Text>

      </View>

    );

  }

  // =========================
  // UI
  // =========================
  return (

    <View style={styles.container}>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() =>

              navigation.navigate(
                'RideDetails',
                {
                  ...item,

                  email: item.email,

                  userType: 'driver',
                },
              )

            }>

            {/* TOP */}

            <View
              style={styles.topRow}>

              <View
                style={
                  styles.leftSection
                }>

                <View
                  style={
                    styles.iconContainer
                  }>

                  <FontAwesome
                    name="car"
                    size={20}
                    color="#28A745"
                  />

                </View>

                <View
                  style={
                    styles.textContainer
                  }>

                  <Text
                    style={
                      styles.title
                    }>
                    {item.title ||
                      'Ride Request'}
                  </Text>

                  <Text
                    style={
                      styles.body
                    }>
                    {item.body ||
                      'Passenger requested ride'}
                  </Text>

                </View>

              </View>

              {/* DELETE */}

              <TouchableOpacity
                style={
                  styles.deleteBtn
                }
                onPress={() =>
                  handleDelete(
                    item.id,
                  )
                }>

                <FontAwesome
                  name="trash"
                  size={18}
                  color="#ff4d4d"
                />

              </TouchableOpacity>

            </View>

            {/* DETAILS */}

            <View
              style={
                styles.detailsContainer
              }>

              <Text
                style={
                  styles.label
                }>
                From:

                <Text
                  style={
                    styles.value
                  }>
                  {' '}
                  {item.from ||
                    '-'}
                </Text>

              </Text>

              <Text
                style={
                  styles.label
                }>
                To:

                <Text
                  style={
                    styles.value
                  }>
                  {' '}
                  {item.destination ||
                    '-'}
                </Text>

              </Text>

              <Text
                style={
                  styles.label
                }>
                Fare:

                <Text
                  style={
                    styles.value
                  }>
                  {' '}
                  Rs{' '}
                  {item.fare ||
                    '0'}
                </Text>

              </Text>

            </View>

          </TouchableOpacity>

        )}
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      '#ffffff',
    paddingHorizontal: 14,
    paddingTop: 10,
  },

  card: {
    backgroundColor:
      '#c9c2c2',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    elevation: 6,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  leftSection: {
    flexDirection: 'row',
    flex: 1,
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent:
      'center',
    alignItems: 'center',
    backgroundColor:
      '#E9F8EE',
  },

  textContainer: {
    marginLeft: 12,
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },

  body: {
    marginTop: 4,
    color: '#555',
  },

  deleteBtn: {
    padding: 6,
  },

  detailsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor:
      '#f0f0f0',
    paddingTop: 12,
  },

  label: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 7,
    fontWeight: '600',
  },

  value: {
    color: '#111',
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    justifyContent:
      'center',
    alignItems: 'center',
  },

  emptyText: {
    marginTop: 14,
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },

});