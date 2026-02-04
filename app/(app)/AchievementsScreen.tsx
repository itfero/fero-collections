import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

type Item = {
  leftBig?: string;
  leftSmall?: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
};

export default function AchievementsScreen() {
  const data: Item[] = [
    {
      leftBig: '2.3 Million+',
      title: 'Doors Installed Over 2 Decades',
      icon: <MaterialIcons name="door-front" size={22} color="#2f3192" />,
    },
    {
      leftBig: '2.5 Lakh sq. ft',
      title: 'Company Shop Floor',
      icon: <MaterialCommunityIcons name="ruler-square" size={22} color="#2f3192" />,
    },
    {
      leftBig: '500+',
      title: 'FeroDoor Personnel',
      icon: <MaterialIcons name="groups" size={22} color="#2f3192" />,
    },
    {
      leftBig: '2,50,000',
      title: 'Doorsets provided every year',
      icon: <MaterialCommunityIcons name="hand-coin" size={22} color="#2f3192" />,
    },
    {
      leftBig: '3',
      title: 'Manufacturing Facilities.',
      subtitle: '2 Factories in Kerala and 1 in Bangalore.',
      icon: <MaterialCommunityIcons name="factory" size={22} color="#2f3192" />,
    },
    {
      leftBig: '150',
      title: 'Survey and Installation Specialists',
      icon: <MaterialCommunityIcons name="tools" size={22} color="#2f3192" />,
    },
    {
      title: 'Offices and service team in Kerala, Telangana, Karnataka and Tamil Nadu',
      icon: <MaterialIcons name="location-on" size={22} color="#2f3192" />,
    },
    {
      title: 'Large Projects Spanning Across Hospitality, Healthcare, Commercial and Residential Sectors.',
      icon: (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <FontAwesome5 name="hospital" size={16} color="#2f3192" />
          <MaterialCommunityIcons name="office-building" size={18} color="#2f3192" />
          <FontAwesome5 name="handshake" size={16} color="#2f3192" />
          <MaterialCommunityIcons name="home-city" size={18} color="#2f3192" />
        </View>
      ),
    },
    {
      title: 'Produce major components in-house (Laminate and LVL).',
      icon: <MaterialCommunityIcons name="tools" size={22} color="#2f3192" />,
    },
    {
      title: 'Experience Centres in Trivandrum, Cochin, Bangalore, Chennai, Kozhikode, Coimbatore and Hyderabad.',
      icon: <MaterialIcons name="home" size={22} color="#2f3192" />,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Achievements</Text>
      <View style={styles.line} />

      {data.map((item, index) => (
        <View key={index} style={styles.row}>
          {/* LEFT TEXT */}
          <View style={styles.left}>
            {item.leftBig && (
              <Text style={styles.bigText}>{item.leftBig}</Text>
            )}
            <View>
              <Text style={styles.title}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.subTitle}>{item.subtitle}</Text>
              )}
            </View>
          </View>

          {/* ICON */}
          <View style={styles.iconBox}>
            {item.icon}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2f3192',
    marginBottom: 12,
  },

  line: {
    height: 1,
    backgroundColor: '#cfd2f3',
    marginBottom: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#dcdff5',
  },

  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  bigText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2f3192',
    minWidth: 90,
  },

  title: {
    fontSize: 14,
    color: '#2f3192',
    fontWeight: '600',
  },

  subTitle: {
    fontSize: 12,
    color: '#4a4fb0',
    marginTop: 2,
  },

  iconBox: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
