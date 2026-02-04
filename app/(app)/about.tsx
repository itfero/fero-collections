import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ServiceIntroScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>
          Ferodoor Serves as{'\n'}
          the <Text style={styles.underline}>Ultimate</Text> Doorset{'\n'}
          <Text style={styles.underline}>Solution</Text> Company.
        </Text>
      </View>

      {/* BODY TEXT */}
      <View style={styles.textBlock}>
        <Text style={styles.paragraph}>
          We are passionate about ensuring every space is fitted with the right door,
          whether that door is customised with us or selected from our pre-existing
          offerings.
        </Text>

        <Text style={styles.paragraph}>
          When it comes to service, we are always eager to ensure that our customers
          choose their Surface, their Frames and any Hardware they may need.
        </Text>

        <Text style={styles.paragraph}>
          Aside from our General Doors, we also have an excellent offering of Special
          Doors that are built to enhance any space they are placed in.
        </Text>

        <Text style={styles.paragraph}>
          Our dedicated FeroDoor installation teams ensure that your site is prepped,
          measured, and installation-ready. The process itself follows a standard flow
          and ensures that your FeroDoor is installed smoothly and excellently.
        </Text>

        <Text style={styles.paragraph}>
          In the unlikely event of malfunction or an issue, our After Sales Support Team
          is expertly trained, prepared, and ready to assist you.
        </Text>
      </View>

    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2f2f85', // deep corporate blue
  },

  content: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 50,
  },

  headerContainer: {
    marginBottom: 40,
  },

  heading: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 46,
  },

  underline: {
    borderBottomWidth: 4,
    borderBottomColor: '#f2c200', // yellow underline
    paddingBottom: 2,
  },

  textBlock: {
    marginTop: 60,
    maxWidth: 520,
  },

  paragraph: {
    color: '#ffffff',
    fontSize: 14.5,
    lineHeight: 24,
    marginBottom: 14,
    opacity: 0.95,
  },
});
