import { StyleSheet, Text, View } from 'react-native';

// Placeholder home screen. The real app screens replace this.
export default function Home() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>qave-app</Text>
      <Text style={styles.body}>The build pipeline works. The app's screens come next.</Text>
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
});
