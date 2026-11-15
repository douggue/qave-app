import { router } from 'expo-router';

import { getBusiness } from '@/data/repo';
import { ComingNext } from '@/features/business/ComingNext';
import { t } from '@/i18n';
import { tabGlyph } from '@/theme/glyphs';

// Business Menu: live menu and sold-out toggles come next. Tonight: open the public spot page.
export default function MenuScreen() {
  const { spotId } = getBusiness();
  return (
    <ComingNext
      caption={t('biz.caption.menu')}
      emoji={tabGlyph.menu}
      title={t('biz.menu.title')}
      body={t('biz.menu.body')}
      action={{
        label: t('biz.menu.action'),
        onPress: () => router.push({ pathname: '/spot/[id]', params: { id: spotId } }),
      }}
    />
  );
}
