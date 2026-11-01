import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';

/** The gap between a field and the list that opens from it. */
const MENU_GAP_PX = 4;

const HIDDEN: CSSProperties = { visibility: 'hidden' };

export type UseMenuPlacementOptions = {
  isOpen: boolean;
  /** The field the list opens from. */
  trigger: RefObject<HTMLElement | null>;
  /** The option to keep in view as the arrows move. */
  activeId: string;
  /** A press anywhere outside the field and the list. */
  onClose: () => void;
};

/**
 * Where a list that opens from a field goes: under it, or over it when the
 * window has no room below. Placed on the window itself, so a dialog or a
 * table that clips its content can't cut it off, and it follows the field as
 * the page scrolls.
 */
export function useMenuPlacement({
  isOpen,
  trigger,
  activeId,
  onClose,
}: UseMenuPlacementOptions) {
  const list = useRef<HTMLUListElement>(null);
  const [style, setStyle] = useState<CSSProperties>(HIDDEN);
  const close = useRef(onClose);
  useLayoutEffect(() => {
    close.current = onClose;
  });

  useLayoutEffect(() => {
    if (!isOpen) return;
    const place = () => {
      const anchor = trigger.current?.getBoundingClientRect();
      const height = list.current?.offsetHeight ?? 0;
      if (!anchor) return;
      const roomBelow = window.innerHeight - anchor.bottom - MENU_GAP_PX;
      const isBelow = height <= roomBelow || roomBelow >= anchor.top;
      setStyle({
        left: anchor.left,
        minWidth: anchor.width,
        top: isBelow
          ? anchor.bottom + MENU_GAP_PX
          : anchor.top - MENU_GAP_PX - height,
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [isOpen, trigger]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !trigger.current?.contains(target) &&
        !list.current?.contains(target)
      ) {
        close.current();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [isOpen, trigger]);

  useEffect(() => {
    if (isOpen) {
      document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, activeId]);

  // Measured before the first paint; hidden until then.
  return { list, style: isOpen ? style : HIDDEN };
}
