import * as Updates from 'expo-updates';
import { StyleSheet, Text, View } from 'react-native';

// Placeholder home screen. The real app screens replace this.
export default function Home() {
  const version = Updates.isEmbeddedLaunch
    ? 'Installed build'
    : `Live update ${Updates.updateId?.slice(0, 8)}`;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>qave-app</Text>
      <Text style={styles.body}>{'Live updates are on. The real screens come next.'}</Text>
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
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
  },
  body: {
    color: '#a7b0cf',
    fontSize: 15,
    textAlign: 'center',
  },
  version: {
    color: '#5d6690',
    fontSize: 12,
    marginTop: 16,
  },
});
