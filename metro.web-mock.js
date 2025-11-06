// Web mock for react-native-bare-kit
// This prevents Metro from crashing when trying to load native modules on web

const NativeBareKit = {
  getEnforcing: () => {
    console.warn('NativeBareKit.getEnforcing() called on web platform - returning empty object');
    return {};
  },
};

module.exports = {
  NativeBareKit,
  default: {
    NativeBareKit,
  },
};

