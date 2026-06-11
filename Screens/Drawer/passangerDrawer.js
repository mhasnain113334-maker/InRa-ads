import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import LottieView from 'lottie-react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

import MainScreen1 from '../Main';
import About from './About';
const Drawer =
  createDrawerNavigator();

function CustomDrawer(
  props
) {
  return (
    <View
      style={
        styles.drawerWrap
      }
    >
      <DrawerContentScrollView
        {...props}
      >
        <DrawerItemList
          {...props}
        />
      </DrawerContentScrollView>

      <View
        style={
          styles.footer
        }
      >
       <View style={styles.footer}>
  
  <LottieView
    source={require('../Asset/Animation - 1747419185098 (1).json')}
    autoPlay
    loop
    style={{ width: 70, height: 70 }}
  />

  <Text style={styles.footerTitle}>
   Powered By                  
   
  </Text>

  <Text style={styles.footerSubtitle}>
    Muhammad Hasnain
  </Text>

</View>
      </View>
    </View>
  );
}

export default function PassangerDrawer() {
  return (
    <Drawer.Navigator
  drawerContent={props => (
    <CustomDrawer {...props} />
  )}
  screenOptions={({ navigation }) => ({
    headerTitle: '',

    drawerStyle: {
      width: 260,
      backgroundColor: '#4CAF50',
    },

    // ✅ THIS FIXES TEXT COLOR
    drawerLabelStyle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },

    drawerActiveTintColor: '#fff',
    drawerInactiveTintColor: '#e6e6e6',

    headerLeft: () => (
      <TouchableOpacity
        style={{ marginLeft: 15 }}
        onPress={() => navigation.openDrawer()}
      >
        <Icon name="menu" size={28} color="#000" />
      </TouchableOpacity>
    ),
  })}
    >
      <Drawer.Screen
        name="Home"
        component={
          MainScreen1
        }
      />

      <Drawer.Screen
        name="About"
        component={
          About

        }
      />
    </Drawer.Navigator>
  );
}

const styles =
  StyleSheet.create({
    drawerWrap: {
      flex: 1,
      backgroundColor:
        '#4CAF50',
    },

   footer: {
  alignItems: 'center',
  padding: 20,
},

footerTitle: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
  marginTop: 8,
},

footerSubtitle: {
  color: '#e6e6e6',
  fontSize: 12,
  textAlign: 'center',
  marginTop: 3,
},
  });