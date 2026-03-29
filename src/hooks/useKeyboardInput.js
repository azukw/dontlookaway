import { useEffect } from "react";
import { keyToDirection } from "../utils/inputMap";

export function useKeyboardInput({ active, onDirection }) {
    useEffect(() => {
        if (!active) return;

        const handleKeyDown = (event) => {
            const direction = keyToDirection(event.key);

            if (!direction) return;

            event.preventDefault();
            onDirection(direction);
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [active, onDirection]);
}