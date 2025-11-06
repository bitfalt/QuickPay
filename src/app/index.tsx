import { Redirect } from 'expo-router';
import { Platform } from 'react-native';

export default function Index() {
  // Always redirect to splash screen first
  // Splash screen will handle wallet initialization and navigation
  // On web, splash screen will work without wallet features for visual testing
  return <Redirect href="/splash" />;
}
