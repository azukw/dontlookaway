export function DirectionIcon({ direction, className = "" }) {
    const rotationMap = {
        up: 0,
        right: 90,
        down: 180,
        left: 270,
    };

    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            style={{ transform: `rotate(${rotationMap[direction]}deg)` }}
            aria-hidden="true"
        >
            <polygon points="50,8 88,44 68,44 68,92 32,92 32,44 12,44" />
        </svg>
    );
}