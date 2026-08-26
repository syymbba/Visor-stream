import { useEffect, type RefObject } from 'react';

export function useClickOutside(
  refs: RefObject<HTMLElement | null> | Array<RefObject<HTMLElement | null>>,
  onOutsideClick: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const refList = Array.isArray(refs) ? refs : [refs];
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && refList.every((ref) => !ref.current?.contains(target))) {
        onOutsideClick();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [refs, onOutsideClick, enabled]);
}