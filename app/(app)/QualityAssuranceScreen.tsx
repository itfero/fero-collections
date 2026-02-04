import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
} from 'react-native';

type LabItem = {
  image: any;
  title: string;
};

export default function QualityAssuranceScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48) / 3; // 3 columns

  const labItems: LabItem[] = [
    {
      image: require('../../assets/qa/1.png'),
      title: 'End Immersion Test',
    },
    {
      image: require('../../assets/qa/2.png'),
      title: 'Humidity Chamber',
    },
    {
      image: require('../../assets/qa/3.png'),
      title: 'Extraction Apparatus for\nDetermination of Formaldehyde',
    },
    {
      image: require('../../assets/qa/4.png'),
      title: 'Tensile Testing Machine',
    },
    {
      image: require('../../assets/qa/5.png'),
      title: 'Slamming Test Equipment',
    },
    {
      image: require('../../assets/qa/6.png'),
      title: 'UV-Vis. Spectrophotometer',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.heading}>Quality Assurance</Text>

      {/* DESCRIPTION */}
      <Text style={styles.paragraph}>
        FeroDoor firmly believes in the importance of quality assurance and ensures
        that our lab testing equipment and procedures are up to industry standards
        and guidelines. We have a dedicated Quality Assurance Team that tests
        everything from the raw materials to the finished products.
      </Text>

      <Text style={styles.paragraph}>
        Laboratory testing helps in identifying potential weaknesses, ensures
        structural integrity, and enhances overall product performance.
      </Text>

      {/* SECTION TITLE */}
      <Text style={styles.sectionTitle}>Overview of Laboratory Equipment:</Text>

      {/* GRID */}
      <View style={styles.grid}>
        {labItems.map((item, i) => (
          <View key={i} style={[styles.card, { width: cardWidth }]}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />
            <Text style={styles.caption}>{item.title}</Text>
          </View>
        ))}
      </View>
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
    marginBottom: 14,
  },

  paragraph: {
    fontSize: 14,
    color: '#2f3192',
    lineHeight: 22,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2f3192',
    marginVertical: 16,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    marginBottom: 18,
  },

  image: {
    width: '100%',
    height: 160,
    borderRadius: 6,
    backgroundColor: '#eee',
  },

  caption: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 12,
    color: '#2f3192',
    lineHeight: 16,
  },
});
