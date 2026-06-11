import React, {
  useEffect,
  useContext,
} from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import Icon from 'react-native-vector-icons/FontAwesome';

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import auth from '@react-native-firebase/auth';

import firestore from '@react-native-firebase/firestore';

import {ProfileContext} from '../Screens/ProfileContext';

// =========================
// LOGIN SCREEN
// =========================

const Login = ({navigation}) => {
  const {
    setEmail,
    setProfile,
  } = useContext(ProfileContext);

  // =========================
  // GOOGLE CONFIG
  // =========================

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '559085082071-k9vo5qcfkmd0g8kqmc64sq0h9ovog98l.apps.googleusercontent.com',

      offlineAccess: true,

      scopes: [
        'openid',
        'profile',
        'email',
      ],
    });
  }, []);

  // =========================
  // AUTO LOGIN
  // =========================

  useEffect(() => {
    const unsubscribe =
      auth().onAuthStateChanged(
        async user => {
          try {
            if (!user) {
              return;
            }

            console.log(
              'AUTO LOGIN USER:',
              user.uid,
            );

            const {
              email,
              uid,
              displayName,
            } = user;

            // SAVE EMAIL
            setEmail(email);

            // IMPORTANT
            // SAVE PROFILE
            setProfile({
              uid: uid,

              email: email,

              name:
                displayName || '',

              role: 'driver',

              phone: '',
              cnic: '',
              gender: '',

              imageUri: null,

              license: '',
              vehicleType: '',

              photoFolder: [],
            });

            console.log(
              'PROFILE SAVED IN CONTEXT',
            );

            navigation.replace(
              'Detail',
              {
                userEmail: email,
                userName:
                  displayName,
              },
            );
          } catch (error) {
            console.log(
              'AUTO LOGIN ERROR:',
              error,
            );
          }
        },
      );

    return unsubscribe;
  }, [navigation]);

  // =========================
  // GOOGLE LOGIN
  // =========================

  const signInWithGoogle =
    async () => {
      try {
        // play services
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });

        // google sign in
        const signInResult =
          await GoogleSignin.signIn();

        console.log(
          'GOOGLE RESULT:',
          signInResult,
        );

        if (!signInResult) {
          Alert.alert(
            'Sign-in failed',
          );

          return;
        }

        // tokens
        const tokens =
          await GoogleSignin.getTokens();

        const {
          idToken,
          accessToken,
        } = tokens;

        if (!idToken) {
          Alert.alert(
            'Error',
            'Google did not return ID token',
          );

          return;
        }

        // firebase credential
        const googleCredential =
          auth.GoogleAuthProvider.credential(
            idToken,
            accessToken,
          );

        // firebase login
        const userCredential =
          await auth().signInWithCredential(
            googleCredential,
          );

        const user =
          userCredential.user;

        const {
          email,
          uid,
          displayName,
        } = user;

        console.log(
          'FIREBASE USER:',
          uid,
        );

        // =========================
        // SAVE CONTEXT
        // =========================

        setEmail(email);

        setProfile({
          uid: uid,

          email: email,

          name:
            displayName || '',

          role: 'driver',

          phone: '',
          cnic: '',
          gender: '',

          imageUri: null,

          license: '',
          vehicleType: '',

          photoFolder: [],
        });

        console.log(
          'PROFILE SAVED SUCCESSFULLY',
        );

        // =========================
        // SAVE FIRESTORE
        // =========================

        await firestore()
          .collection('Inra')
          .doc(email)
          .set(
            {
              uid: uid,

              email: email,

              name:
                displayName || '',

              role: 'driver',

              lastLogin:
                firestore.FieldValue.serverTimestamp(),
            },
            {
              merge: true,
            },
          );

        console.log(
          'USER SAVED IN FIRESTORE',
        );

        // IMPORTANT
        // NAVIGATE AFTER PROFILE SAVE
        navigation.replace(
          'Detail',
          {
            userEmail: email,

            userName:
              displayName,
          },
        );
      } catch (error) {
        console.log(
          'GOOGLE SIGN IN ERROR:',
          error,
        );

        if (
          error.code ===
          statusCodes.SIGN_IN_CANCELLED
        ) {
          Alert.alert(
            'Cancelled',
            'User cancelled sign-in',
          );
        } else if (
          error.code ===
          statusCodes.IN_PROGRESS
        ) {
          Alert.alert(
            'In Progress',
            'Sign-in already in progress',
          );
        } else if (
          error.code ===
          statusCodes.PLAY_SERVICES_NOT_AVAILABLE
        ) {
          Alert.alert(
            'Play Services Error',
            'Google Play Services not available',
          );
        } else {
          Alert.alert(
            'Error',
            error.message,
          );
        }
      }
    };

  return (
    <LinearGradient
      colors={[
        '#00c853',
        '#64dd40',
      ]}
      style={styles.container}>
      <Text style={styles.title}>
        InRa Login
      </Text>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={
          signInWithGoogle
        }>
        <Icon
          name="google"
          size={22}
          color="#4285F4"
        />

        <Text
          style={
            styles.googleText
          }>
          Sign In with Google
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent:
      'center',

    alignItems: 'center',

    paddingHorizontal: 30,
  },

  title: {
    fontSize: 36,

    fontWeight: 'bold',

    color: '#fff',

    marginBottom: 80,
  },

  googleButton: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#fff',

    padding: 14,

    borderRadius: 10,
  },

  googleText: {
    marginLeft: 10,

    color: '#00c853',

    fontSize: 18,

    fontWeight: '600',
  },
});

export default Login;