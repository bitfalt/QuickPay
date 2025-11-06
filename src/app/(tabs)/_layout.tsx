import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(5, 22, 34, 0.92)',
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 72,
    paddingBottom: 14,
    paddingTop: 12,
  },
  label: {
    fontSize: 12,
    fontFamily: 'serif',
    marginTop: 4,
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#F2F6FB',
        tabBarInactiveTintColor: '#8AA1B7',
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          title: 'Send',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="send-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="receive"
        options={{
          title: 'Receive',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

