import React from 'react';
import { View, Text, ImageBackground, StyleSheet, ScrollView } from 'react-native';
const About = () => {
  return (
    <ImageBackground
      source={require('../image/privicyicon.png')} // your watermark image
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="contain"
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>About & Pravicy</Text>

        <Text style={styles.paragraph}>
          Our application is a locally developed platform designed to support the local transportation system. It provides users with a reliable, efficient, and user-friendly environment that ensures smooth communication and seamless service access.

The app is designed to save time and reduce unnecessary travel by enabling users to quickly request rides, including rickshaws, cars, and motorcycles. In addition, users can conveniently order food from nearby restaurants with just a single tap.

Our mission is to deliver a trusted and comfortable service that fulfills everyday transportation and food delivery needs while enhancing convenience and efficiency. We encourage all users to remain respectful, responsible, and cooperative to ensure a positive and well-connected community experience.


*******************************************
'In Urdu'**********************************

ہماری ایپ ایک مقامی طور پر تیار کردہ پلیٹ فارم ہے جو لوکل ٹرانسپورٹ سسٹم کی معاونت کے لیے بنایا گیا ہے۔ یہ صارفین کو ایک قابل اعتماد، مؤثر اور آسان استعمال کا ماحول فراہم کرتی ہے جس کے ذریعے خدمات تک رسائی نہایت آسان اور ہموار ہو جاتی ہے۔

یہ ایپ آپ کو سفر میں تکلیف کا سامنا کرنے سے بچاتی ہے، جس کے ذریعے صارفین آسانی سے رکشہ، کار اور موٹر سائیکل کی رائیڈ سروس حاصل کر سکتے ہیں۔ اس کے علاوہ، صارفین قریبی ریسٹورنٹس سے صرف ایک کلک کے ذریعے کھانا بھی آرڈر کر سکتے ہیں۔

ہمارا مقصد ایک قابل اعتماد اور آرام دہ سروس فراہم کرنا ہے جو روزمرہ کی ٹرانسپورٹ اور فوڈ ڈیلیوری کی ضروریات کو پورا کرے اور سہولت اور کارکردگی کو بہتر بنائے۔ ہم تمام صارفین کو ترغیب دیتے ہیں کہ وہ باہمی احترام اور ذمہ داری کے ساتھ اس کمیونٹی کا حصہ بنیں تاکہ ایک مثبت اور مربوط تجربہ قائم کیا جا سکے۔

        </Text>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#a8f7a1ff',
  },
  backgroundImage: {
    width: 500,
    height: 500,
    opacity: 0.18,
    position: 'absolute',
    top: 130,
    left: -68,
  },
  content: {
    padding: 20,
    paddingBottom: 40, // extra padding for scrolling
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
});

export default About;
