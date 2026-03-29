import { useEffect } from "react";

export function useSwipeInput({
                                  active,
                                  targetRef,
                                  onDirection,
                                  threshold = 30,
                              }) {
    useEffect(() => {
        if (!active || !targetRef.current) return;

        const element = targetRef.current;
        let startX = 0;
        let startY = 0;

        const handleTouchStart = (event) => {
            const touch = event.changedTouches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        };

        const handleTouchEnd = (event) => {
            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;

            if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
                return;
            }

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                onDirection(deltaX > 0 ? "right" : "left");
            } else {
                onDirection(deltaY > 0 ? "down" : "up");
            }
        };

        element.addEventListener("touchstart", handleTouchStart, { passive: true });
        element.addEventListener("touchend", handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener("touchstart", handleTouchStart);
            element.removeEventListener("touchend", handleTouchEnd);
        };
    }, [active, onDirection, targetRef, threshold]);
}