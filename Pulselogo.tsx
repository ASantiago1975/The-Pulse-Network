// PulseLogo.tsx - Cross-Platform High-Density Custom Logo Image Container
import React from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';

interface LogoProps {
  size?: number; // Configurable footprint layout sizing
}

export default function PulseLogo({ size = 200 }: LogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={require('./assets/my-logo.png')}
        style={[
          styles.image,
          Platform.OS === 'ios' && styles.iosShadow // Applies premium depth rendering on iOS devices
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iosShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  }
});
