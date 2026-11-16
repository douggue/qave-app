import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';

import { Badge, Chip, Glyph, Screen, ScreenTitle, Sticker } from '@/components/ui';
import { answer } from '@/data/ask';
import { AnswerCard } from '@/features/ask/AnswerCard';
import { ChatBubble, TypingDots } from '@/features/ask/ChatBubble';
import { useShowOnMap } from '@/hooks/use-show-on-map';
import { useSpots } from '@/hooks/use-spots';
import { t, type StringKey } from '@/i18n';
import { ui } from '@/theme/emoji';
import { space, type as typeScale } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Message = { id: number; from: 'me' | 'bot'; text: string; spotIds: string[] };

const CHIPS: StringKey[] = ['ask.chip.tacos', 'ask.chip.rainy', 'ask.chip.late', 'ask.chip.sweet', 'ask.chip.bbq'];
const TYPING_MS = 600;

// Ask Lokal: a canned chat, clearly labeled Demo. Kept in memory only.
export default function AskScreen() {
  const { c } = useTheme();
  const spots = useSpots();
  const showOnMap = useShowOnMap();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(1);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 0, from: 'bot', text: t('ask.hello'), spotIds: [] },
  ]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    const mine: Message = { id: nextId.current++, from: 'me', text, spotIds: [] };
    setMessages((m) => [...m, mine]);
    setDraft('');
    setTyping(true);
    const reply = answer(text, spots);
    timer.current = setTimeout(() => {
      const replyText = t(reply.key, reply.params);
      setMessages((m) => [...m, { id: nextId.current++, from: 'bot', text: replyText, spotIds: reply.spotIds }]);
      setTyping(false);
      AccessibilityInfo.announceForAccessibility(replyText);
    }, TYPING_MS);
  };

  const canSend = draft.trim().length > 0 && !typing;

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <ScreenTitle
            title={t('ask.title')}
            sub={t('ask.demoNote')}
            right={<Badge label={t('common.demo').toUpperCase()} accessibilityLabel={t('common.demo')} tone="grape" />}
          />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.fill}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m) => (
            <View key={m.id} style={styles.message}>
              <ChatBubble from={m.from} text={m.text} />
              {m.spotIds.map((id) => {
                const spot = spots.find((s) => s.id === id);
                return spot ? <AnswerCard key={id} spot={spot} onShowOnMap={showOnMap} /> : null;
              })}
            </View>
          ))}
          {typing ? <TypingDots /> : null}
        </ScrollView>

        <View style={styles.bottom}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            accessibilityLabel={t('ask.suggest')}
            contentContainerStyle={styles.chips}
          >
            {CHIPS.map((key) => (
              <Chip key={key} label={t(key)} onPress={() => send(t(key))} />
            ))}
          </ScrollView>
          <View style={styles.composer}>
            <Sticker radius={16} drop={4} style={styles.inputWrap}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={() => send(draft)}
                placeholder={t('ask.placeholder')}
                placeholderTextColor={c.ink2}
                accessibilityLabel={t('ask.inputA11y')}
                returnKeyType="send"
                style={[styles.input, typeScale.body, { color: c.ink }]}
              />
            </Sticker>
            <Pressable
              onPress={() => send(draft)}
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel={t('ask.send')}
              accessibilityState={{ disabled: !canSend }}
              style={!canSend && styles.disabled}
            >
              {({ pressed }) => (
                <Sticker
                  radius={16}
                  drop={4}
                  bg={c.neon}
                  line={c.ctaLine}
                  dropColor={c.ctaDrop}
                  pressed={pressed && canSend}
                  style={styles.send}
                  faceStyle={styles.sendFace}
                >
                  <Glyph of={ui.send} size={19} color={c.onNeon} strokeWidth={2.6} />
                </Sticker>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingTop: space.sm, paddingHorizontal: 20, paddingBottom: space.sm },
  messages: { paddingHorizontal: 20, paddingVertical: space.lg, gap: space.md },
  message: { gap: space.sm },
  bottom: { gap: space.sm, paddingBottom: space.sm },
  chips: { gap: space.sm, paddingHorizontal: 20, paddingBottom: 3 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: 20 },
  inputWrap: { flex: 1 },
  input: { minHeight: 48, borderRadius: 16, paddingHorizontal: space.md, paddingVertical: 10 },
  send: { width: 52 },
  sendFace: { height: 48, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.45 },
});
