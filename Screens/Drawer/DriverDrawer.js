import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';

import MainScreen2 from '../Main2';

import About from './About';

const Drawer = createDrawerNavigator();

function CustomDriverDrawerContent(props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#4CAF50' }}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.footerLogoContainer}>
        <LottieView
          source={require('../Asset/Animation - 1747419185098 (1).json')}
          autoPlay
          loop
          style={styles.lottieAnimation}
        />
        <Text style={styles.footerText}>Powered by YourApp</Text>
      </View>
    </View>
  );
}

export default function DriverDrwer() {
  return (
    <Drawer.Navigator
      initialRouteName="DriverMain"
      drawerContent={(props) => <CustomDriverDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,

        headerTitle: '',
        headerTitleAlign: 'center',

        headerStyle: {
          backgroundColor: '#fff',
        },

        headerShadowVisible: false,

        headerTintColor: '#000',

        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.menuButton}
          >
            <Icon name="menu" size={28} color="#000" />
          </TouchableOpacity>
        ),

        drawerStyle: {
          backgroundColor: '#4CAF50',
          width: 240,
        },

        drawerActiveTintColor: '#ffffff',
        drawerInactiveTintColor: '#e0f4ea',
        drawerActiveBackgroundColor: '#388E3C',

        drawerLabelStyle: {
          fontSize: 16,
        },
      })}
    >
      <Drawer.Screen name="DriverMain" component={MainScreen2} />
      <Drawer.Screen name="About" component={About} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    marginLeft: 15,
  },

  footerLogoContainer: {
    alignItems: 'center',
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 10,
  },

  lottieAnimation: {
    width: 90,
    height: 90,
  },

  footerText: {
    marginTop: 8,
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
  },
});