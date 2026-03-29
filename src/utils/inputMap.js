export const directionToArrow = {
    up: "↑",
    right: "→",
    down: "↓",
    left: "←",
};

export const directionToLabel = {
    up: "Haut",
    right: "Droite",
    down: "Bas",
    left: "Gauche",
};

export function keyToDirection(key) {
    const normalized = key.length === 1 ? key.toLowerCase() : key;

    switch (normalized) {
        case "ArrowUp":
        case "w":
        case "z":
            return "up";

        case "ArrowRight":
        case "d":
            return "right";

        case "ArrowDown":
        case "s":
            return "down";

        case "ArrowLeft":
        case "a":
        case "q":
            return "left";

        default:
            return null;
    }
}