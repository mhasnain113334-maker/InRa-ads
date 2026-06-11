import 'react-native-gesture-handler';
                    //import 'react-native-reanimated';

                    import React, { useEffect, useState } from 'react';
                    import { View, ActivityIndicator, Platform } from 'react-native';

                    import messaging from '@react-native-firebase/messaging';
                    import notifee, { AndroidImportance } from '@notifee/react-native';

                    import Appnavigator from './Screens/Appnavigator';
                    import { ProfileProvider } from './Screens/ProfileContext';

                    /* ---------------- TYPES ---------------- */
                    type StringMap = {
                      [key: string]: string;
                    };

                    type AnyMap = {
                      [key: string]: unknown;
                    } | undefined;

                    /* ---------------- SAFE DATA ---------------- */
                    const stringifyData = (data: AnyMap): StringMap => {
                      const result: StringMap = {};

                      Object.keys(data || {}).forEach((key: string) => {
                        result[key] = String(data?.[key]);
                      });

                      return result;
                    };

                    /* ---------------- BACKGROUND HANDLER ---------------- */
                    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
                      const safeData = stringifyData(remoteMessage?.data);

                      await notifee.displayNotification({
                        title: safeData['title'] || 'New Notification',
                        body: safeData['body'] || '',
                        data: safeData,
                        android: {
                          channelId: 'default',
                          importance: AndroidImportance.HIGH,
                          pressAction: { id: 'default' },
                        },
                      });
                    });

                    /* ---------------- MAIN APP ---------------- */
                    const InRa = () => {
                      const [ready, setReady] = useState(false);

                      useEffect(() => {
                        const init = async () => {
                          try {
                            if (Platform.OS === 'android') {
                              await messaging().registerDeviceForRemoteMessages().catch(() => {});
                            }

                            await notifee.createChannel({
                              id: 'default',
                              name: 'Default Channel',
                              importance: AndroidImportance.HIGH,
                            }).catch(() => {});

                            await messaging().requestPermission().catch(() => {});
                            await messaging().getToken().catch(() => {});
                          } catch (error) {
                            console.log('INIT ERROR:', error);
                          } finally {
                            setTimeout(() => setReady(true), 300);
                          }
                        };

                        init();
                      }, []);

                      /* ---------------- LOADING ---------------- */
                      if (!ready) {
                        return (
                          <View
                            style={{
                              flex: 1,
                              backgroundColor: '#ffffff',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <ActivityIndicator size="large" color="#000" />
                          </View>
                        );
                      }

                      /* ---------------- APP ---------------- */
                      return (
                        <ProfileProvider>
                          <Appnavigator />
                        </ProfileProvider>
                      );
                    };

                    export default InRa;