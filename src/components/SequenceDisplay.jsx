import { DirectionIcon } from "./DirectionIcon";

export function SequenceDisplay({
                                    phase,
                                    flashDirection,
                                    errorDirection,
                                    currentRound,
                                    playerIndex,
                                    flashPulseKey,
                                    t,
                                }) {
    const shownDirection = errorDirection || flashDirection;

    let subtitle = t.observe;
    if (phase === "input") subtitle = t.inputProgress(playerIndex, currentRound);
    if (phase === "transition") subtitle = t.validated;
    if (phase === "gameOver") subtitle = t.error;

    return (
        <div className="sequence-block">
            <div className="sequence-copy">
                <div className="sequence-title">
                    {t.roundLabel} {currentRound}
                </div>
                <p className="status-line">{subtitle}</p>
            </div>

            <div
                className={`sequence-visual ${
                    errorDirection ? "is-error" : ""
                } ${phase === "showing" ? "is-showing" : ""} ${
                    phase === "transition" ? "is-success" : ""
                }`}
            >
                {shownDirection ? (
                    <div
                        key={`${shownDirection}-${flashPulseKey}-${phase}`}
                        className="sequence-icon-wrap"
                    >
                        <DirectionIcon
                            direction={shownDirection}
                            className="direction-icon direction-icon-large"
                        />
                    </div>
                ) : (
                    <div className="sequence-placeholder" />
                )}
            </div>
        </div>
    );
}