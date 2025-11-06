import { Platform } from 'react-native';

type UniqueIdProvider = () => string | Promise<string>;

let getUniqueId: UniqueIdProvider = () => `${Platform.OS}-device`;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const deviceInfo = require('react-native-device-info') as { getUniqueId: UniqueIdProvider };
  if (typeof deviceInfo.getUniqueId === 'function') {
    getUniqueId = deviceInfo.getUniqueId;
  }
} catch (error) {
  console.info('react-native-device-info not available; using fallback device id.', error);
}

export const fetchDeviceUniqueId = async (): Promise<string> => {
  try {
    const value = await Promise.resolve(getUniqueId());
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  } catch (error) {
    console.warn('Failed to obtain device unique id, falling back:', error);
  }

  return `${Platform.OS}-fallback`;
};
