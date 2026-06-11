// Appnavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import Splash from './Splash';
import PassengerProfile from './PassengerProfile';
import DriverProfile from './DriverProfile';
import Login from './login';

import PassangerDrawer from './Drawer/passangerDrawer';
import DriverDrwer from './Drawer/DriverDrawer';

import Propa from './propa';


import RideDetails from './ridedetail';
import RideHistory from './histor';
import Notifications from './chat';
import Detail from './Detail';


const Stack = createNativeStackNavigator();

const Appnavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">

        {/* AUTH FLOW */}
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Detail"
          component={Detail}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="PassengerProfile"
          component={PassengerProfile}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="DriverProfile"
          component={DriverProfile}
          options={{ headerShown: false }}
        />

        {/* DRAWERS */}
        <Stack.Screen
          name="MainScreen1"
          component={PassangerDrawer}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="MainScreen2"
          component={DriverDrwer}
          options={{ headerShown: false }}
        />

        {/* OTHER SCREENS */}
        <Stack.Screen
          name="Propa"
          component={Propa}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{ headerShown: true }}
        />

        

        <Stack.Screen
          name="RideDetails"
          component={RideDetails}
          options={{ headerShown: true }}
        />

        <Stack.Screen
          name="RideHistory"
          component={RideHistory}
          options={{ headerShown: false}}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Appnavigator;