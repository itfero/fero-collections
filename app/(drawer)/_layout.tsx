import { Drawer } from 'expo-router/drawer';
import { Platform, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DrawerContent from '../components/DrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        drawerType: 'front',
        swipeEnabled: true,

        headerLeft: ({ tintColor, canGoBack }) => (
          <>
          {/* <Pressable
            onPress={() => navigation.toggleDrawer()}
            style={{ paddingHorizontal: 12 }}
          >
            <MaterialIcons
              name="menu"
              size={24}
              color={Platform.OS === 'android' ? '#000' : '#fff'}
            />
          </Pressable> */}
          <Pressable onPress={() => navigation.toggleDrawer()} style={{ paddingHorizontal: 12 }}>
    <MaterialIcons name="menu" size={24} color={tintColor} />
  </Pressable></>
          
          
        ),

        headerStyle:
          Platform.OS === 'android'
            ? undefined
            : { backgroundColor: '#111' },

        headerTintColor:
          Platform.OS === 'android' ? '#000' : '#fff',
      })}
    >
      <Drawer.Screen
        name="index"
        options={{ title: 'Fero Collections', headerShown: true }}
      />

      <Drawer.Screen
        name="master/main-topic"
        options={{ title: 'Main Topic', headerShown: true }}
      />

      <Drawer.Screen
        name="master/sub-topic"
        options={{ title: 'Sub Topic', headerShown: true }}
      />

      <Drawer.Screen
        name="master/sub-title"
        options={{ title: 'Sub Title', headerShown: true }}
      />

      <Drawer.Screen
        name="about"
        options={{ title: 'About Us', headerShown: true }}
      />
    </Drawer>
  );
}
