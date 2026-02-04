import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { API_PREFIX, media_PREFIX } from '../../../lib/config';

type ImageItem = {
  imageId: number;
  url: string;
  sort: number;
};

type SubTopic = {
  id: string;
  title: string;
  images: ImageItem[];
};

export default function TopicSliderScreen() {debugger
  const { data } = useLocalSearchParams<{ data: string }>();
  const { width } = useWindowDimensions();
console.log('data', data);
  const subtopics: SubTopic[] = useMemo(() => {
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }, [data]);

  if (!subtopics.length) return null;

  return (
    <FlatList
      data={subtopics}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.section}>
          <Text style={styles.heading}>{item.title}</Text>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={item.images.sort((a, b) => a.sort - b.sort)}
            keyExtractor={(img) => String(img.imageId)}
            renderItem={({ item: img }) => (
              <Image
                source={{ uri: `${media_PREFIX}${img.url}` }}  // ✅ API image
                style={[
                  styles.image,
                  { width: width * 0.8, height: width * 0.5 },
                ]}
                resizeMode="cover"
              />
            )}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  image: {
    marginRight: 16,
    borderRadius: 16,
  },
});
