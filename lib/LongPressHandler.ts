export default function createLongPressHandlers<T>(
  data: T,
  onLongPress: (data: T) => void,
  opts?: {
    holdMs?: number;
    moveThreshold?: number;
    stationaryDelay?: number;
  }
) {
  const { holdMs = 500, moveThreshold = 10, stationaryDelay = 120 } = opts || {};

  let startX = 0;
  let startY = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stationTimer: ReturnType<typeof setTimeout> | null = null;
  let pointerDown = false;
  let scrolledSinceDown = false;
  let scrollTarget: HTMLElement | Window | null = null;

  const clearTimers = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (stationTimer) { clearTimeout(stationTimer); stationTimer = null; }
  };

  const onScroll = () => {
    scrolledSinceDown = true;
    clearTimers();
  };

  const getScrollParent = (el: HTMLElement | null): HTMLElement | Window => {
    let node = el;
    while (node && node !== document.documentElement) {
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflow + style.overflowY + style.overflowX)) return node;
      node = node.parentElement;
    }
    return window;
  };

  const attachScrollListener = (el: HTMLElement) => {
    scrollTarget = getScrollParent(el);
    (scrollTarget as any).addEventListener('scroll', onScroll, { passive: true });
  };

  const removeScrollListener = () => {
    if (scrollTarget) {
      (scrollTarget as any).removeEventListener('scroll', onScroll);
      scrollTarget = null;
    }
  };

  return {
    onPointerDown: (e: React.PointerEvent) => {
      if ('button' in e && (e as any).button && (e as any).button !== 0) return;

      pointerDown = true;
      scrolledSinceDown = false;
      startX = e.clientX;
      startY = e.clientY;
      clearTimers();

      attachScrollListener(e.currentTarget as HTMLElement);

      stationTimer = setTimeout(() => {
        stationTimer = null;
        if (!pointerDown || scrolledSinceDown) return;
        timer = setTimeout(() => {
          timer = null;
          if (!scrolledSinceDown) onLongPress(data);
        }, holdMs);
      }, stationaryDelay);
    },

    onPointerMove: (e: React.PointerEvent) => {
      if (!pointerDown) return;
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      if (dx > moveThreshold || dy > moveThreshold) {
        scrolledSinceDown = true;
        clearTimers();
      }
    },

    onPointerUp: () => {
      pointerDown = false;
      clearTimers();
      removeScrollListener();
    },
    onPointerLeave: () => {
      pointerDown = false;
      clearTimers();
      removeScrollListener();
    },
    onPointerCancel: () => {
      pointerDown = false;
      clearTimers();
      removeScrollListener();
    },
  };
}
