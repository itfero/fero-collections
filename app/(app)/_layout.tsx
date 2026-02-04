// import { Drawer } from 'expo-router/drawer';
// import { Pressable, Platform } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import DrawerContent from '../components/DrawerContent';

// export default function AppLayout() {
//   return (
//     <Drawer
//       drawerContent={(props) => <DrawerContent {...props} />}
//       screenOptions={({ navigation }: any) => ({
//         headerShown: true,
//         headerLeft: () => (
//           <Pressable
//             onPress={() => navigation.toggleDrawer()}
//             style={{ paddingHorizontal: 12 }}
//           >
//             <MaterialIcons
//               name="menu"
//               size={24}
//               color={Platform.OS === 'android' ? '#000' : '#fff'}
//             />
//           </Pressable>
//         ),
//       })}
//     >
//       <Drawer.Screen name="index" options={{ title: 'Fero Collections' }} />
//       <Drawer.Screen name="master/main-topic" options={{ title: 'Main Topic' }} />
//       <Drawer.Screen name="master/sub-topic" options={{ title: 'Sub Topic' }} />
//       <Drawer.Screen name="master/sub-title" options={{ title: 'Sub Title' }} />
//       <Drawer.Screen name="about" options={{ title: 'About us' }} />
//     </Drawer>
//   );
// }
import { Drawer } from 'expo-router/drawer';
import DrawerContent from '../components/DrawerContent';

export default function AppLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{ headerShown: true }}
    >
      {/* Drawer Screens */}
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
