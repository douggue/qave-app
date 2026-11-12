import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';

import { TabBar, tabRoutes } from '@/components/nav/TabBar';
import { GoLiveSheet } from '@/features/business/GoLiveSheet';
import { useStore } from '@/state/store';
import { useTheme } from '@/theme/use-theme';

// One Tabs navigator holds both sets. The custom tab bar draws the set for the
// current mode; the other set gets `href: null` (SDK 58 js-tabs maps it to `hidden`).
const ROUTES = ['index', 'drops', 'ask', 'you', 'today', 'where', 'menu', 'promote'] as const;

export default function TabsLayout() {
  const { c } = useTheme();
  const { bizMode } = useStore().state;
  const visible = tabRoutes(bizMode);
  return (
    <View style={{ flex: 1, backgroundColor: c.paper }}>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.paper } }}
      >
        {ROUTES.map((name) => (
          <Tabs.Screen key={name} name={name} options={visible.includes(name) ? {} : { href: null }} />
        ))}
      </Tabs>
      <GoLiveSheet />
    </View>
  );
}
