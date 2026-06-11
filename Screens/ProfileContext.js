// ProfileContext.js

import React, {
  createContext,
  useState,
} from 'react';

// =========================
// CREATE CONTEXT
// =========================

export const ProfileContext =
  createContext();

// =========================
// PROVIDER
// =========================

export const ProfileProvider = ({
  children,
}) => {

  // =========================
  // LOGIN EMAIL
  // =========================

  const [email, setEmail] =
    useState('');

  // =========================
  // PROFILE STATE
  // =========================

  const [profile, setProfile] =
    useState({

      // IMPORTANT
      // SAVE FIREBASE USER UID
      uid: '',

      // ROLE
      role: '', // driver / passenger

      // BASIC INFO
      name: '',
      phone: '',
      cnic: '',
      gender: '',

      // PROFILE IMAGE
      imageUri: null,

      // DRIVER INFO
      license: '',
      vehicleType: '',

      // DRIVER PHOTOS
      photoFolder: [],

    });

  // =========================
  // PROVIDER VALUE
  // =========================

  return (

    <ProfileContext.Provider
      value={{

        // EMAIL
        email,
        setEmail,

        // PROFILE
        profile,
        setProfile,

      }}>

      {children}

    </ProfileContext.Provider>

  );

};