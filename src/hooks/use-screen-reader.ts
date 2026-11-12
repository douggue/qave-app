import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** True while a screen reader (VoiceOver, TalkBack) is on. Updates live. */
export function useScreenReader(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((value) => mounted && setOn(value))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setOn);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return on;
}
