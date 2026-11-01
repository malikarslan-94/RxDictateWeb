import { useEffect, useState } from 'react';

/**
 * Whether any part of an element is on screen, with scroll containers taken
 * into account. Give `observe` to the element as its `ref`; the element may
 * appear later (after a load), and counts as on screen until measured.
 */
export function useInView<T extends Element>() {
  const [node, setNode] = useState<T | null>(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsInView(entry.isIntersecting),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return { observe: setNode, isInView };
}
