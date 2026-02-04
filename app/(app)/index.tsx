import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getMainTopics, getBrochureTree } from '../../lib/api';
import { useAuth } from '../../lib/auth/AuthContext';
import { API_PREFIX, media_PREFIX } from '../../lib/config';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

/* ---------------- TYPES ---------------- */

// type SubTopic = {
//   id: string;
//   title: string;
// };

// type Topic = {
//   id: string;
//   title: string;
//   subtopics: SubTopic[];
// };
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

type Topic = {
  id: string;
  title: string;
  subtopics: SubTopic[];
};

export default function IndexScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const [openId, setOpenId] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  async function handleLogout() {
    await logout();
  }

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId(prev => (prev === id ? null : id));
  };

  /* ---------------- LOAD DATA FROM API ---------------- */

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch complete brochure tree with nested subtopics, subtitles, and attachments
      const response = await getBrochureTree();
      
      // Transform API response to match UI structure
      const transformedTopics: Topic[] = response.map((mainTopic: any) => ({
        id: String(mainTopic.id),
        title: mainTopic.name,
        subtopics: (mainTopic.SubTopics || []).map((subTopic: any) => ({
          id: String(subTopic.id),
          title: subTopic.name,
          images: (subTopic.SubTitles || []).flatMap((subTitle: any) =>
            (subTitle.Attachments || []).map((attachment: any) => ({
              imageId: attachment.id,
              url: media_PREFIX+'/' + (attachment.uri_medium || attachment.uri_original),
             uri_medium: attachment.uri_medium ? media_PREFIX+'/' + attachment.uri_medium : undefined,
              uri_original: attachment.uri_original ? media_PREFIX+'/' + attachment.uri_original : undefined,
              subtitle: subTitle.title ?? subTitle.SubTitle ?? '',
              sort: 0,
            }))
          ),
        })),
      }));

      setTopics(transformedTopics);
    } catch (err) {
      console.error("API Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {topics.map(topic => {
        const isOpen = openId === topic.id;

        return (
          <LinearGradient
            key={topic.id}
            colors={['#0c4ef4', '#4f7cff']}
            style={styles.card}
          >
            {/* HEADER */}
            <Pressable onPress={() => toggle(topic.id)}>
              <View style={styles.header}>
                <View style={styles.row}>
                  <MaterialCommunityIcons
                    name="door"
                    size={26}
                    color="#fff"
                  />
                  <Text style={styles.topic}>{topic.title}</Text>
                </View>

                <MaterialCommunityIcons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={30}
                  color="#fff"
                />
              </View>
            </Pressable>

            {/* EXPANDABLE CONTENT */}
            {isOpen && (
              <View style={styles.content}>
                {/* VIEW ALL */}
                  {/* <Text style={{ color: '#000' }}>{JSON.stringify(topic.subtopics)}</Text> */}
                <Pressable
                  onPress={() => {
                    // Flatten all images from all sub-topics
                    const allImages = topic.subtopics.flatMap(sub => sub.images);
                    router.push({
                      pathname: '/slider',
                      params: {
                        data: JSON.stringify(allImages),
                      },
                    })
                  }}
                >
                  <View style={styles.item}>
                    <MaterialCommunityIcons
                      name="image-multiple"
                      size={20}
                      color="#0c4ef4"
                    />
                    <Text style={styles.viewAll}>View All Images</Text>
                  </View>
                </Pressable>

                {/* SUBTOPICS */}
                {topic.subtopics.map(sub => (
                  <Pressable
                    key={sub.id}
                    onPress={() =>
                      router.push({
                        pathname: '/slider',
                        params: { data: JSON.stringify([sub])}
                      })
                    }
                  >
                    <View style={styles.item}>
                      <MaterialCommunityIcons
                        name="image-outline"
                        size={18}
                        color="#333"
                      />
                      <Text style={styles.subtopic}>{sub.title}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </LinearGradient>
        );
      })}
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    ...Platform.select({
      web: {
        boxShadow: '0px 6px 8px rgba(0,0,0,0.25)'
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
      }
    }),
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  topic: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },

  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 14,
    padding: 12,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  viewAll: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4ef4',
  },

  subtopic: {
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
  },
});
