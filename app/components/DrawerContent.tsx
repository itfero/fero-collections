import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth/AuthContext';

export default function DrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [masterOpen, setMasterOpen] = useState(false);

  const username = user?.data?.[0]?.UserName ?? 'User';
  const email = user?.data?.[0]?.Email ?? '';

  // const navigate = (path: string) => {
  //   props.navigation.closeDrawer?.();
  //   // push so it behaves like normal navigation; replace if you want to prevent back
  //   router.push(path);
  // };
  const navigate = (path: string) => {
    props.navigation.closeDrawer?.();

    // If user is not authenticated, send them to login instead of pushing protected routes
    if (!user) {
      console.debug('[DrawerContent] user not authenticated, redirecting to login');
      router.replace('/(auth)/login');
      return;
    }

    // push so it behaves like normal navigation; replace if you want to prevent back
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Logout error', e);
    } finally {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarFallback}>
          <Text style={styles.initials}>
            {String(username).split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{username}</Text>
          {email ? <Text style={styles.email}>{email}</Text> : null}
        </View>
      </View>

      <View style={styles.items}>
        <Pressable style={styles.item} onPress={() => navigate('/')}>
          <MaterialIcons name="collections" size={20} color="#333" />
          <Text style={styles.itemText}>Fero Collections</Text>
        </Pressable>

        {/* Sub Topic Master group */}
        <Pressable style={styles.item} onPress={() => setMasterOpen(prev => !prev)}>
          <MaterialIcons name="collections" size={20} color="#333" />
          <Text style={styles.itemText}>Master</Text>
          <MaterialIcons name={masterOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={20} color="#333" style={{ marginLeft: 'auto' }} />
        </Pressable>

        {masterOpen && (
          <View style={styles.subItems}>
            <Pressable style={styles.subItem} onPress={() => navigate('/master/main-topic')}>
              <Text style={styles.subItemText}>Main Topic</Text>
            </Pressable>
            <Pressable style={styles.subItem} onPress={() => navigate('/master/sub-topic')}>
              <Text style={styles.subItemText}>Sub Topic</Text>
            </Pressable>
            <Pressable style={styles.subItem} onPress={() => navigate('/master/sub-title')}>
              <Text style={styles.subItemText}>Sub Title</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.item} onPress={() => navigate('/about')}>
          <MaterialIcons name="info" size={20} color="#333" />
          <Text style={styles.itemText}>About us</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={() => navigate('/CertificationsScreen')}>
          <MaterialCommunityIcons name="certificate-outline" size={24} color="black" />
          <Text style={styles.itemText}>Certifications</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={() => navigate('/AchievementsScreen')}>
          <FontAwesome name="thumbs-up" size={24} color="black" />
          <Text style={styles.itemText}>Achievments</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={() => navigate('/QualityAssuranceScreen')}>
          <MaterialCommunityIcons name="equalizer" size={24} color="black" />
          <Text style={styles.itemText}>Quality & Assurance</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={() => navigate('/about')}>
          <MaterialCommunityIcons name="progress-check" size={24} color="black" />
          <Text style={styles.itemText}>Completed Projects</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={() => navigate('/text')}>
          <MaterialCommunityIcons name="progress-clock" size={24} color="black" />
          <Text style={styles.itemText}>Ongoing Projects</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
        <Text style={styles.version}>v1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? 48 : 36, paddingHorizontal: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarFallback: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  initials: { fontSize: 18, fontWeight: '700', color: '#666' },
  headerText: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  email: { fontSize: 12, color: '#666' },

  items: { flex: 1, marginTop: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  itemText: { marginLeft: 12, fontSize: 16 },
  subItems: { paddingLeft: 36, backgroundColor: 'transparent' },
  subItem: { paddingVertical: 10 },
  subItemText: { fontSize: 15, color: '#333' },

  footer: { borderTopWidth: 1, borderTopColor: '#f2f2f2', paddingTop: 12, alignItems: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ff3b30', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
  version: { marginTop: 12, color: '#999', fontSize: 12 },
});