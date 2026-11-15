import { ComingNext } from '@/features/business/ComingNext';
import { t } from '@/i18n';
import { useStore } from '@/state/store';
import { tabGlyph } from '@/theme/glyphs';

// Business Where: stops editor and demand map come next. Tonight: go live from a saved stop.
export default function WhereScreen() {
  const { state, actions } = useStore();
  const live = !!state.liveSession;
  return (
    <ComingNext
      caption={t('biz.caption.where')}
      emoji={tabGlyph.where}
      title={t('biz.where.title')}
      body={t('biz.where.body')}
      action={{
        label: live ? t('biz.alreadyLive') : t('biz.where.action'),
        onPress: actions.openGoLive,
        disabled: live,
      }}
    />
  );
}
