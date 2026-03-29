import { useEffect, useRef } from "react";

export function useSwipeInput({
                                  active,
                                  targetRef,
                                  onDirection,
                                  threshold = 42,
                                  axisLockRatio = 1.22,
                              }) {
    const startRef = useRef({ x: 0, y: 0 });
    const triggeredRef = useRef(false);

    useEffect(() => {
        const element = targetRef.current;
        if (!active || !element) return;

        const handleTouchStart = (event) => {
            const touch = event.changedTouches[0];
            startRef.current = {
                x: touch.clientX,
                y: touch.clientY,
            };
            triggeredRef.current = false;
        };

        const handleTouchMove = (event) => {
            if (triggeredRef.current) return;

            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - startRef.current.x;
            const deltaY = touch.clientY - startRef.current.y;

            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            if (absX < threshold && absY < threshold) {
                return;
            }

            if (absX > absY * axisLockRatio) {
                triggeredRef.current = true;
                onDirection(deltaX > 0 ? "right" : "left");
                return;
            }

            if (absY > absX * axisLockRatio) {
                triggeredRef.current = true;
                onDirection(deltaY > 0 ? "down" : "up");
            }
        };

        const handleTouchEnd = () => {
            triggeredRef.current = false;
        };

        const handleTouchCancel = () => {
            triggeredRef.current = false;
        };

        element.addEventListener("touchstart", handleTouchStart, { passive: true });
        element.addEventListener("touchmove", handleTouchMove, { passive: true });
        element.addEventListener("touchend", handleTouchEnd, { passive: true });
        element.addEventListener("touchcancel", handleTouchCancel, { passive: true });

        return () => {
            element.removeEventListener("touchstart", handleTouchStart);
            element.removeEventListener("touchmove", handleTouchMove);
            element.removeEventListener("touchend", handleTouchEnd);
            element.removeEventListener("touchcancel", handleTouchCancel);
        };
    }, [active, axisLockRatio, onDirection, targetRef, threshold]);
}