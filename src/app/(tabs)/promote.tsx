import { useToast } from '@/components/ui';
import { ComingNext } from '@/features/business/ComingNext';
import { t } from '@/i18n';
import { tabGlyph } from '@/theme/glyphs';

// Business Promote: the drop creator comes next.
export default function PromoteScreen() {
  const toast = useToast();
  return (
    <ComingNext
      caption={t('biz.caption.promote')}
      emoji={tabGlyph.promote}
      title={t('biz.promote.title')}
      body={t('biz.promote.body')}
      action={{
        label: t('biz.promote.action'),
        onPress: () => toast.show(t('common.comingNext'), { emoji: tabGlyph.promote }),
      }}
    />
  );
}
