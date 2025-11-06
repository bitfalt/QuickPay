const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

// Try to detect if we're building for web
const isWebBuild = process.argv.some(arg => arg.includes('--web') || arg.includes('web')) || 
                   process.env.EXPO_PUBLIC_PLATFORM === 'web';

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
  // Ensure module paths include root node_modules
  nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
  // On web, provide mock for react-native-bare-kit before Metro tries to resolve it
  ...(isWebBuild ? {
    extraNodeModules: {
      'react-native-bare-kit': path.resolve(__dirname, 'metro.web-mock.js'),
    },
  } : {}),
};

// Custom resolveRequest that handles web platform and mocks native modules
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle @/ alias
  if (moduleName.startsWith('@/')) {
    const resolvedPath = moduleName.replace('@/', path.resolve(__dirname, 'src') + '/');
    try {
      return context.resolveRequest(context, resolvedPath, platform);
    } catch (e) {
      // If the resolved path fails, fall through
    }
  }
  
  // On web platform, provide mock for react-native-bare-kit
  if (platform === 'web' || isWebBuild) {
    if (moduleName === 'react-native-bare-kit') {
      return {
        filePath: path.resolve(__dirname, 'metro.web-mock.js'),
        type: 'sourceFile',
      };
    }
  }
  
  // Use original resolver
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Only apply WDK polyfills on native platforms (not web)
let finalConfig = config;

if (!isWebBuild) {
  try {
    const { configureMetroForWDK } = require('@tetherto/wdk-react-native-provider/metro-polyfills');
    const wdkConfig = configureMetroForWDK(config);
    
    // Wrap the WDK's resolveRequest with our custom alias logic
    const wdkResolveRequest = wdkConfig.resolver.resolveRequest;
    
    wdkConfig.resolver.resolveRequest = (context, moduleName, platform) => {
      // Handle @/ alias
      if (moduleName.startsWith('@/')) {
        const resolvedPath = moduleName.replace('@/', path.resolve(__dirname, 'src') + '/');
        try {
          return context.resolveRequest(context, resolvedPath, platform);
        } catch (e) {
          // If the resolved path fails, fall through to WDK resolver
        }
      }
      
      // On web, provide mock for react-native-bare-kit
      if (platform === 'web' && moduleName === 'react-native-bare-kit') {
        return {
          filePath: path.resolve(__dirname, 'metro.web-mock.js'),
          type: 'sourceFile',
        };
      }
      
      // Delegate to WDK's resolveRequest
      return wdkResolveRequest(context, moduleName, platform);
    };
    
    finalConfig = wdkConfig;
  } catch (error) {
    // If WDK config fails (e.g., on web), use default config
    console.warn('WDK Metro config not available, using default config:', error.message);
  }
} else {
  console.log('Web build detected - skipping WDK Metro polyfills');
}

module.exports = finalConfig;
