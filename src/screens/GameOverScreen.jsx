function formatAttemptNumber(value, language) {
    if (!value) return null;

    if (language === "fr") {
        if (value === 1) return "1er";
        return `${value}e`;
    }

    const mod10 = value % 10;
    const mod100 = value % 100;

    if (mod10 === 1 && mod100 !== 11) return `${value}st`;
    if (mod10 === 2 && mod100 !== 12) return `${value}nd`;
    if (mod10 === 3 && mod100 !== 13) return `${value}rd`;
    return `${value}th`;
}

export function GameOverScreen({ result, bestScore, onRetry, onMenu, t, language }) {
    const formattedAttempt = formatAttemptNumber(result.attemptNumber, language);

    return (
        <section className="card game-over-card">
            <div className="eyebrow">{t.result}</div>

            <h1 className="hero-title">
                {result.perfectRun ? t.perfectRunTitle : t.failedRunTitle}
            </h1>

            <div className="score-number">{result.score}</div>

            <p className="hero-subtitle">
                {result.perfectRun
                    ? t.perfectRunSubtitle
                    : t.failedRunSubtitle(result.score, result.roundReached)}
            </p>

            {result.mode === "daily" && result.attemptNumber ? (
                <p className="attempt-line">{t.attemptLine(formattedAttempt)}</p>
            ) : null}

            <div className="results-grid">
                <div className="result-card result-card-highlight">
                    <span className="result-label">{t.bestScore}</span>
                    <strong className="result-value">{bestScore}</strong>
                </div>

                {result.mode === "daily" && result.attemptNumber ? (
                    <div className="result-card">
                        <span className="result-label">{t.attemptOfDay}</span>
                        <strong className="result-value">#{result.attemptNumber}</strong>
                    </div>
                ) : null}

                <div className="result-card">
                    <span className="result-label">{t.mode}</span>
                    <strong className="result-value">
                        {result.mode === "daily" ? t.daily : t.endless}
                    </strong>
                </div>

                <div className="result-card">
                    <span className="result-label">{t.correctInputs}</span>
                    <strong className="result-value">{result.totalCorrectInputs}</strong>
                </div>

                <div className="result-card">
                    <span className="result-label">{t.averageSpeed}</span>
                    <strong className="result-value">
                        {result.avgInputMs ? `${result.avgInputMs} ms` : "—"}
                    </strong>
                </div>

                <div className="result-card">
                    <span className="result-label">{t.averageRate}</span>
                    <strong className="result-value">
                        {result.inputsPerSecond ? `${result.inputsPerSecond}/s` : "—"}
                    </strong>
                </div>

                <div className="result-card">
                    <span className="result-label">{t.accuracy}</span>
                    <strong className="result-value">{result.accuracy}%</strong>
                </div>

                <div className="result-card">
                    <span className="result-label">{t.totalInputTime}</span>
                    <strong className="result-value">
                        {result.totalInputTimeMs
                            ? `${(result.totalInputTimeMs / 1000).toFixed(2)} s`
                            : "—"}
                    </strong>
                </div>

                <div className="result-card result-card-status">
                    <span className="result-label">{t.status}</span>
                    <strong className="result-value">
                        {result.perfectRun ? t.success : t.failure}
                    </strong>
                </div>
            </div>

            <div className="result-actions">
                <button type="button" className="button-primary" onClick={onRetry}>
                    {t.retry}
                </button>

                <button type="button" className="button-secondary" onClick={onMenu}>
                    {t.backToMenu}
                </button>
            </div>
        </section>
    );
}