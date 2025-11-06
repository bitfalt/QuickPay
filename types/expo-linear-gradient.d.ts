declare module 'expo-linear-gradient' {
  import type { ComponentType } from 'react';
  import type { ViewProps } from 'react-native';

  interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
  }

  export const LinearGradient: ComponentType<LinearGradientProps>;
}

