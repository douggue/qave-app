import * as Updates from 'expo-updates';
import { Platform, StyleSheet, Text, View } from 'react-native';

// Placeholder home screen. The real app screens replace this.
export default function Home() {
  const version =
    Platform.OS === 'web'
      ? 'Web preview'
      : Updates.isEmbeddedLaunch
        ? 'Installed build'
        : `Live update ${Updates.updateId?.slice(0, 8)}`;

  return (
    <View style={styles.screen}>
      <Text style={styles.emoji}>🌮</Text>
      <Text style={styles.title}>Live update works!</Text>
      <Text style={styles.body}>Update test #1</Text>
      <Text style={styles.version}>{version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
    backgroundColor: '#0b1020',
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    color: '#ffcc33',
    fontSize: 28,
    fontWeight: '700',
  },
  body: {
    color: '#a7b0cf',
    fontSize: 15,
  },
  version: {
    color: '#5d6690',
    fontSize: 12,
    marginTop: 16,
  },
});
