import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { GameOverScreen } from "./screens/GameOverScreen";
import { GameScreen } from "./screens/GameScreen";
import { MenuScreen } from "./screens/MenuScreen";
import {
    formatResetCountdown,
    getMsUntilNextParisMidnight,
    getTodayKey,
} from "./utils/generateSequence";
import { translations } from "./utils/i18n";

const STORAGE_PREFIX = "memory-arrows";
const THEME_STORAGE_KEY = `${STORAGE_PREFIX}-theme`;
const SKIN_STORAGE_KEY = `${STORAGE_PREFIX}-skin`;
const LANGUAGE_STORAGE_KEY = `${STORAGE_PREFIX}-language`;

function getStorageKey(mode, dateKey) {
    if (mode === "daily" && dateKey) {
        return `${STORAGE_PREFIX}-best-daily-${dateKey}`;
    }

    return `${STORAGE_PREFIX}-best-training`;
}

function readBestScore(mode, dateKey) {
    if (typeof window === "undefined") {
        return 0;
    }

    const rawValue = window.localStorage.getItem(getStorageKey(mode, dateKey));
    return Number(rawValue ?? "0");
}

function saveBestScore(mode, score, dateKey) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(getStorageKey(mode, dateKey), String(score));
}

function getDailyAttemptsKey(dateKey) {
    return `${STORAGE_PREFIX}-daily-attempts-${dateKey}`;
}

function readDailyAttempts(dateKey) {
    if (typeof window === "undefined") {
        return 0;
    }

    const rawValue = window.localStorage.getItem(getDailyAttemptsKey(dateKey));
    return Number(rawValue ?? "0");
}

function incrementDailyAttempts(dateKey) {
    if (typeof window === "undefined") {
        return 1;
    }

    const nextValue = readDailyAttempts(dateKey) + 1;
    window.localStorage.setItem(getDailyAttemptsKey(dateKey), String(nextValue));
    return nextValue;
}

function readUiPreference(key, fallbackValue) {
    if (typeof window === "undefined") {
        return fallbackValue;
    }

    return window.localStorage.getItem(key) ?? fallbackValue;
}

function App() {
    const [screen, setScreen] = useState("menu");
    const [mode, setMode] = useState("daily");
    const [sessionId, setSessionId] = useState(0);
    const [lastResult, setLastResult] = useState(null);
    const [bestScore, setBestScore] = useState(0);
    const [panel, setPanel] = useState(null);
    const [confirmExitOpen, setConfirmExitOpen] = useState(false);
    const [currentAttemptNumber, setCurrentAttemptNumber] = useState(null);
    const [theme, setTheme] = useState(() => readUiPreference(THEME_STORAGE_KEY, "light"));
    const [skin, setSkin] = useState(() => readUiPreference(SKIN_STORAGE_KEY, "ember"));
    const [language, setLanguage] = useState(() => readUiPreference(LANGUAGE_STORAGE_KEY, "fr"));
    const [resetCountdownLabel, setResetCountdownLabel] = useState(() =>
        formatResetCountdown(getMsUntilNextParisMidnight())
    );

    const todayKey = getTodayKey();
    const t = translations[language];

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(SKIN_STORAGE_KEY, skin);
    }, [skin]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }, [language]);

    useEffect(() => {
        const updateCountdown = () => {
            setResetCountdownLabel(formatResetCountdown(getMsUntilNextParisMidnight()));
        };

        updateCountdown();
        const intervalId = window.setInterval(updateCountdown, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    const startGame = (selectedMode) => {
        setMode(selectedMode);

        if (selectedMode === "daily") {
            const freshTodayKey = getTodayKey();
            const attemptNumber = incrementDailyAttempts(freshTodayKey);
            setCurrentAttemptNumber(attemptNumber);
        } else {
            setCurrentAttemptNumber(null);
        }

        setSessionId((previous) => previous + 1);
        setScreen("playing");
    };

    const handleGameOver = (result) => {
        const previousBest = readBestScore(result.mode, result.dateKey);
        const nextBest = Math.max(previousBest, result.score);

        saveBestScore(result.mode, nextBest, result.dateKey);

        const enrichedResult = {
            ...result,
            attemptNumber: result.mode === "daily" ? currentAttemptNumber : null,
        };

        setLastResult(enrichedResult);
        setBestScore(nextBest);
        setScreen("gameOver");
    };

    const retryGame = () => {
        const nextMode = lastResult?.mode ?? mode;
        setMode(nextMode);

        if (nextMode === "daily") {
            const freshTodayKey = getTodayKey();
            const attemptNumber = incrementDailyAttempts(freshTodayKey);
            setCurrentAttemptNumber(attemptNumber);
        } else {
            setCurrentAttemptNumber(null);
        }

        setSessionId((previous) => previous + 1);
        setScreen("playing");
    };

    const backToMenu = () => {
        setScreen("menu");
        setConfirmExitOpen(false);
    };

    const handleBrandClick = () => {
        if (screen === "playing") {
            setConfirmExitOpen(true);
            return;
        }

        setScreen("menu");
    };

    const confirmExitGame = () => {
        setConfirmExitOpen(false);
        setScreen("menu");
    };

    return (
        <div className="app-shell" data-theme={theme} data-skin={skin}>
            <Header
                onHelpClick={() => setPanel("help")}
                onBrandClick={handleBrandClick}
                theme={theme}
                onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                skin={skin}
                onSkinChange={setSkin}
                language={language}
                onLanguageChange={setLanguage}
                t={t}
            />

            <main className="page-content">
                {screen === "menu" && (
                    <MenuScreen
                        dailyLabel={`Daily • ${todayKey}`}
                        resetCountdownLabel={resetCountdownLabel}
                        onStart={startGame}
                        t={t}
                    />
                )}

                {screen === "playing" && (
                    <GameScreen
                        key={`${mode}-${sessionId}`}
                        mode={mode}
                        onGameOver={handleGameOver}
                        t={t}
                    />
                )}

                {screen === "gameOver" && lastResult && (
                    <GameOverScreen
                        result={lastResult}
                        bestScore={bestScore}
                        onRetry={retryGame}
                        onMenu={backToMenu}
                        t={t}
                        language={language}
                    />
                )}
            </main>

            {panel === "help" && (
                <div className="dialog-overlay" onClick={() => setPanel(null)}>
                    <div className="dialog-card" onClick={(event) => event.stopPropagation()}>
                        <div className="dialog-head">
                            <div className="eyebrow">{t.howToPlayTitle}</div>
                            <button
                                type="button"
                                className="ghost-button"
                                onClick={() => setPanel(null)}
                            >
                                {t.close}
                            </button>
                        </div>

                        <div className="dialog-content">
                            <div className="dialog-kicker">{t.howToPlayIntro}</div>

                            <p className="help-reset-note">{t.helpResetNote(resetCountdownLabel)}</p>

                            <div className="rules-grid">
                                <div className="rules-step">
                                    <strong>{t.step1Title}</strong>
                                    <span>{t.step1Desc}</span>
                                </div>

                                <div className="rules-step">
                                    <strong>{t.step2Title}</strong>
                                    <span>{t.step2Desc}</span>
                                </div>

                                <div className="rules-step">
                                    <strong>{t.step3Title}</strong>
                                    <span>{t.step3Desc}</span>
                                </div>
                            </div>

                            <div className="rules-controls">
                                <div className="rules-control-card">
                                    <strong>{t.desktopCardTitle}</strong>
                                    <span>{t.desktopCardDesc}</span>
                                </div>

                                <div className="rules-control-card">
                                    <strong>{t.mobileCardTitle}</strong>
                                    <span>{t.mobileCardDesc}</span>
                                </div>

                                <div className="rules-control-card">
                                    <strong>{t.dailyCardTitle}</strong>
                                    <span>{t.dailyCardDesc}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {confirmExitOpen && (
                <div className="dialog-overlay" onClick={() => setConfirmExitOpen(false)}>
                    <div className="dialog-card confirm-dialog" onClick={(event) => event.stopPropagation()}>
                        <div className="eyebrow">{t.quitGame}</div>
                        <h2 className="confirm-title">{t.areYouSure}</h2>
                        <p className="confirm-text">{t.exitWarning}</p>

                        <div className="confirm-actions">
                            <button
                                type="button"
                                className="button-secondary"
                                onClick={() => setConfirmExitOpen(false)}
                            >
                                {t.cancel}
                            </button>
                            <button type="button" className="button-primary" onClick={confirmExitGame}>
                                {t.quit}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;