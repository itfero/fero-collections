import { View, Image } from 'react-native';

export default function Test() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={{ uri: 'http://hogg5a.hostwincloud.in:7001/main/att/door/SNPT0141.jpg' }}
        style={{ width: 300, height: 300 }}
        resizeMode="contain"
      />
    </View>
  );
}
