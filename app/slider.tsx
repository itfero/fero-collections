import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, ImageBackground } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ZoomImage from './components/ZoomImage';

type ImageItem = {
  imageId?: number;
  url: string;
  uri_original?: string;
  uri_medium?: string;
  subtitle?: string;
};

export default function SliderScreen() {
  const paramsOut = useLocalSearchParams<any>();
  const rawData = paramsOut.data;
  let paramsObj: any = {};
  try {
    const parsed = JSON.parse(rawData);
    // parsed might be:
    // - an array of images (when caller passed JSON.stringify(allImages))
    // - an array with a single object { images: [...], title }
    // - an object with images
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && parsed[0] && parsed[0].images) {
        paramsObj = parsed[0];
      } else {
        // array of image items
        paramsObj = { images: parsed };
      }
    } else if (parsed && typeof parsed === 'object') {
      paramsObj = parsed;
    }
  } catch (e) {
    console.error('Failed to parse slider params', e);
    paramsObj = {};
  }
  const params = paramsObj;
  console.log('slider params', params);
  const { width, height } = useWindowDimensions();

  // Determine responsive container size: cap to reasonable max on large screens
  const maxContainerWidth = Math.min(width * 0.92, 1200);
  const maxContainerHeight = Math.min(height * 0.85, 1000);

  const title = params.title ?? 'Images';

  /* ---------------- PARSE IMAGES ---------------- */

  const images: ImageItem[] = useMemo(() => {
    try {
      const raw = params.images ?? [];
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return parsed.map((i: any) =>
        typeof i === 'string'
          ? { url: i }
          : {
              imageId: i.imageId,
              url: i.url || i.uri_medium || i.uri_original,
              uri_medium: i.uri_medium,
              uri_original: i.uri_original,
              subtitle: i.subtitle,
            }
      );
    } catch (e) {
      console.error("Image parse error:", e);
      return [];
    }
  }, [params.images]);

  const [index, setIndex] = useState(0);

  if (!images.length) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: '#fff' }}>No images found</Text>
      </View>
    );
  }

  return (
    <>
      {/* <ImageBackground
         source={require('../assets/door-slider-bg1.jpg')}
  style={{ flex: 1 }}
  resizeMode="cover"
  sizeMode="cover"
      > */}
        <View style={styles.container}>
        {/* TITLE */}
        <Text style={styles.title}>{title}</Text>

        {/* SLIDER */}
        <View style={styles.slider}>
          {/* LEFT */}
          <Pressable
            disabled={index === 0}
            onPress={() => setIndex(i => Math.max(0, i - 1))}
          >
            <Text style={[styles.arrow, index === 0 && styles.disabled]}>{'<'}</Text>
          </Pressable>

          {/* IMAGE */}
            <View style={{ width: maxContainerWidth, height: maxContainerHeight, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: '100%', height: '100%' }}>
                <ZoomImage
                  sourceThumb={{ uri: images[index].uri_medium || images[index].url }}
                  sourceOriginal={{ uri: images[index].uri_original || images[index].url }}
                />
              </View>
              <Text style={styles.imageSubtitle}>{images[index].subtitle ?? ''}</Text>
            </View>

          {/* RIGHT */}
          <Pressable
            disabled={index === images.length - 1}  
            onPress={() => setIndex(i => Math.min(images.length - 1, i + 1))}
          >
            <Text
              style={[
                styles.arrow,
                index === images.length - 1 && styles.disabled,
              ]}
            >
              {'>'}
            </Text>
          </Pressable>
        </View>

        {/* COUNTER */}
        <Text style={styles.count}>
          {index + 1} / {images.length}
        </Text>
      </View>
      {/* </ImageBackground> */}
      
    </>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a09b9b',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#000000',
  },
  empty: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  slider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    color: '#fff',
    fontSize: 40,
    padding: 20,
  },
  disabled: {
    color: '#555',
  },
  count: {
    color: '#aaa',
    marginTop: 10,
  },
  imageSubtitle: {
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: '85%'
  },
});
