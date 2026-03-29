import { DirectionIcon } from "./DirectionIcon";

function ArrowButton({
                         direction,
                         disabled,
                         isActive,
                         isError,
                         onDirection,
                         hint,
                         activePulseKey,
                     }) {
    const pulseClass = isActive ? `pulse-${activePulseKey % 2}` : "";

    return (
        <button
            type="button"
            className={`arrow-button ${isActive ? "is-active" : ""} ${
                isError ? "is-error" : ""
            } ${pulseClass}`}
            disabled={disabled}
            onClick={() => onDirection(direction)}
            aria-label={direction}
        >
            <DirectionIcon direction={direction} className="arrow-button-icon" />
            <span className="arrow-button-hint">{hint}</span>
        </button>
    );
}

export function ArrowPad({
                             disabled,
                             activeDirection,
                             errorDirection,
                             activePulseKey,
                             onDirection,
                         }) {
    return (
        <div className="arrow-pad">
            <div className="arrow-pad-row arrow-pad-row-top">
                <ArrowButton
                    direction="up"
                    disabled={disabled}
                    isActive={activeDirection === "up"}
                    isError={errorDirection === "up"}
                    onDirection={onDirection}
                    hint="W / Z / ↑"
                    activePulseKey={activePulseKey}
                />
            </div>

            <div className="arrow-pad-row arrow-pad-row-bottom">
                <ArrowButton
                    direction="left"
                    disabled={disabled}
                    isActive={activeDirection === "left"}
                    isError={errorDirection === "left"}
                    onDirection={onDirection}
                    hint="A / Q / ←"
                    activePulseKey={activePulseKey}
                />

                <ArrowButton
                    direction="down"
                    disabled={disabled}
                    isActive={activeDirection === "down"}
                    isError={errorDirection === "down"}
                    onDirection={onDirection}
                    hint="S / ↓"
                    activePulseKey={activePulseKey}
                />

                <ArrowButton
                    direction="right"
                    disabled={disabled}
                    isActive={activeDirection === "right"}
                    isError={errorDirection === "right"}
                    onDirection={onDirection}
                    hint="D / →"
                    activePulseKey={activePulseKey}
                />
            </div>
        </div>
    );
}