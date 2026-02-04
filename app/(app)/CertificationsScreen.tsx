import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type CertItem = {
  image?: any;
  title: string;
  sub?: string;
  rightIcon?: boolean;
};

export default function CertificationsScreen() {
  const row1: CertItem[] = [
    {
      image: require('../../assets/cert/greenpro.png'), // <-- replace with your logo
      title: 'Green Pro\nCertified Products.',
    },
    {
      image: require('../../assets/cert/isi.png'),
      title: 'ISI Licensed Flush Door',
      sub: 'IS 2191 – CM/L-6400132703\nIS 2202 – CM/L-6400132699',
    },
    {
      title: 'VOC Emissions Certification',
      sub: 'Assess and certify the indoor air quality',
      rightIcon: true,
    },
  ];

  const row2: CertItem[] = [
    {
      image: require('../../assets/cert/iso.png'),
      title: 'ISO 9001: 2015',
      sub: 'Quality Management System',
    },
    {
      image: require('../../assets/cert/fire.png'),
      title: 'Fire Resistance Certification',
      sub: 'Fire Safety for Doors',
    },
    {
      title: 'Elemental Analysis Report',
      sub: 'Elemental Composition by ED-XRF',
      rightIcon: true,
    },
  ];

  const renderRow = (data: CertItem[]) => (
    <View style={styles.row}>
      {data.map((item, i) => (
        <View key={i} style={styles.card}>
          {item.image && (
            <Image source={item.image} style={styles.logo} resizeMode="contain" />
          )}

          {!item.image && item.rightIcon && (
            <View style={styles.checkCircle}>
              <MaterialIcons name="check" size={18} color="#fff" />
            </View>
          )}

          <Text style={styles.title}>{item.title}</Text>
          {item.sub && <Text style={styles.sub}>{item.sub}</Text>}
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Certifications</Text>

      {/* Row 1 */}
      {renderRow(row1)}

      <View style={styles.divider} />

      {/* Row 2 */}
      {renderRow(row2)}
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2f3192',
    marginBottom: 18,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  card: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  logo: {
    width: 70,
    height: 50,
    marginBottom: 8,
  },

  title: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#2f3192',
  },

  sub: {
    textAlign: 'center',
    fontSize: 11,
    color: '#4a4fb0',
    marginTop: 4,
    lineHeight: 15,
  },

  divider: {
    height: 1,
    backgroundColor: '#dcdff5',
    marginVertical: 20,
  },

  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f2b705',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
});
