import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';

import { TabBar } from '@/components/nav/TabBar';
import { ReportPlaceholder } from '@/components/report/ReportPlaceholder';
import { useTheme } from '@/theme/use-theme';

export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.paper }}>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.paper } }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="drops" />
        <Tabs.Screen name="ask" />
        <Tabs.Screen name="you" />
      </Tabs>
      <ReportPlaceholder />
    </View>
  );
}
