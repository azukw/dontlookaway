import { useRef, useState } from "react";

const SHARE_URL = "https://dla-daily.vercel.app";

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

function getResultDate(result) {
    return result.dateKey ?? new Date().toISOString().slice(0, 10);
}

function buildShareText(result, language) {
    const date = getResultDate(result);

    const scoreLabel = result.mode === "daily"
        ? `${result.score}/100`
        : String(result.score);

    if (language === "fr") {
        if (result.mode === "daily" && result.attemptNumber) {
            return [
                "DontLookAway — Daily",
                date,
                `Essai #${result.attemptNumber} • Score ${scoreLabel}`,
                SHARE_URL,
            ].join("\n");
        }

        if (result.mode === "daily") {
            return [
                "DontLookAway — Daily",
                date,
                `Score ${scoreLabel}`,
                SHARE_URL,
            ].join("\n");
        }

        // Endless: pas de date
        return [
            "DontLookAway — Endless",
            `Score ${scoreLabel}`,
            SHARE_URL,
        ].join("\n");
    }

    if (result.mode === "daily" && result.attemptNumber) {
        return [
            "DontLookAway — Daily",
            date,
            `Attempt #${result.attemptNumber} • Score ${scoreLabel}`,
            SHARE_URL,
        ].join("\n");
    }

    if (result.mode === "daily") {
        return [
            "DontLookAway — Daily",
            date,
            `Score ${scoreLabel}`,
            SHARE_URL,
        ].join("\n");
    }

    // Endless: no date
    return [
        "DontLookAway — Endless",
        `Score ${scoreLabel}`,
        SHARE_URL,
    ].join("\n");
}

async function copyTextToClipboard(text) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
}

export function GameOverScreen({ result, bestScore, onRetry, onMenu, t, language }) {
    const formattedAttempt = formatAttemptNumber(result.attemptNumber, language);
    const [shareCopied, setShareCopied] = useState(false);
    const shareTimeoutRef = useRef(null);

    const handleShare = async () => {
        try {
            const shareText = buildShareText(result, language);
            await copyTextToClipboard(shareText);
            setShareCopied(true);

            if (shareTimeoutRef.current) {
                window.clearTimeout(shareTimeoutRef.current);
            }

            shareTimeoutRef.current = window.setTimeout(() => {
                setShareCopied(false);
            }, 1800);
        } catch {
            setShareCopied(false);
        }
    };

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
                <div className="result-actions-top">
                    <button type="button" className="button-primary" onClick={onRetry}>
                        {t.retry}
                    </button>

                    <button type="button" className="button-secondary" onClick={handleShare}>
                        {shareCopied ? t.copied : t.share}
                    </button>
                </div>

                <button type="button" className="button-secondary result-menu-button" onClick={onMenu}>
                    {t.backToMenu}
                </button>
            </div>
        </section>
    );
}