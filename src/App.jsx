import { useEffect, useRef, useState } from "react";
import { Header } from "./components/Header";
import { MobileSettingsPanel } from "./components/MobileSettingsPanel";
import { GameOverScreen } from "./screens/GameOverScreen";
import { GameScreen } from "./screens/GameScreen";
import { MenuScreen } from "./screens/MenuScreen";
import {
    formatResetCountdown,
    getMsUntilNextParisMidnight,
    getTodayKey,
} from "./utils/generateSequence";
import { translations } from "./utils/i18n";
import {
    playRandomAudio,
    playSound,
    preloadSounds,
    startLoop,
    stopAllLoops,
    stopLoop,
    unlockAudio,
} from "./utils/sounds";

const STORAGE_PREFIX = "memory-arrows";
const THEME_STORAGE_KEY = `${STORAGE_PREFIX}-theme`;
const SKIN_STORAGE_KEY = `${STORAGE_PREFIX}-skin`;
const LANGUAGE_STORAGE_KEY = `${STORAGE_PREFIX}-language`;
const MUTED_STORAGE_KEY = `${STORAGE_PREFIX}-muted`;
const RULES_SEEN_STORAGE_KEY = `${STORAGE_PREFIX}-rules-seen`;

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
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [confirmExitOpen, setConfirmExitOpen] = useState(false);
    const [currentAttemptNumber, setCurrentAttemptNumber] = useState(null);
    const [theme, setTheme] = useState(() => readUiPreference(THEME_STORAGE_KEY, "light"));
    const [skin, setSkin] = useState(() => readUiPreference(SKIN_STORAGE_KEY, "ember"));
    const [language, setLanguage] = useState(() => readUiPreference(LANGUAGE_STORAGE_KEY, "fr"));
    const [isMuted, setIsMuted] = useState(
        () => readUiPreference(MUTED_STORAGE_KEY, "false") === "true"
    );
    const [resetCountdownLabel, setResetCountdownLabel] = useState(() =>
        formatResetCountdown(getMsUntilNextParisMidnight())
    );
    const [soundsReady, setSoundsReady] = useState(false);

    const preloadedRef = useRef(false);
    const lastUiResultKeyRef = useRef("");

    const todayKey = getTodayKey();
    const t = translations[language];

    useEffect(() => {
        preloadSounds([
            { name: "menu-loop", url: "/sounds/menu-loop.wav" },
            { name: "game-loop", url: "/sounds/game-loop.wav" },
            { name: "daily-start", url: "/sounds/daily-start.wav" },
            { name: "endless-start-1", url: "/sounds/endless-start-1.wav" },
            { name: "endless-start-2", url: "/sounds/endless-start-2.wav" },
            { name: "endless-start-3", url: "/sounds/endless-start-3.wav" },
            { name: "show-vertical", url: "/sounds/show-vertical.wav" },
            { name: "show-horizontal", url: "/sounds/show-horizontal.wav" },
            { name: "correct-vertical", url: "/sounds/correct-vertical.wav" },
            { name: "correct-horizontal", url: "/sounds/correct-horizontal.wav" },
            { name: "error-1", url: "/sounds/error-1.wav" },
            { name: "error-2", url: "/sounds/error-2.wav" },
            { name: "error-3", url: "/sounds/error-3.wav" },
            { name: "error-4", url: "/sounds/error-4.wav" },
            { name: "ui-defeat", url: "/sounds/ui-defeat.wav" },
            { name: "ui-victory", url: "/sounds/ui-victory.wav" },
            { name: "ui-sound", url: "/sounds/open-help.wav" },
        ]).then(() => {
            preloadedRef.current = true;
            setSoundsReady(true);
        });
    }, []);

    // Première visite: afficher le popup des règles
    useEffect(() => {
        if (typeof window === "undefined") return;
        const seen = window.localStorage.getItem(RULES_SEEN_STORAGE_KEY);
        if (!seen) {
            setPanel("help");
            window.localStorage.setItem(RULES_SEEN_STORAGE_KEY, "true");
        }
    }, []);

    // Tenter de déverrouiller l'audio au chargement (si autorisé), sinon ça démarrera au premier geste.
    useEffect(() => {
        if (!soundsReady || isMuted) return;

        unlockAudio()
            .then(() => {
                // La logique menu/playing (effects ci-dessous) s'occupe de lancer le bon loop.
            })
            .catch(() => {
                // Certains navigateurs bloquent tant qu'il n'y a pas d'interaction utilisateur.
            });
    }, [soundsReady, isMuted]);

    // Fallback: au premier clic/tap, déverrouiller l'audio et (re)lancer le loop si besoin.
    useEffect(() => {
        if (typeof window === "undefined") return;

        const tryUnlock = () => {
            unlockAudio().then(() => {
                if (isMuted || !soundsReady) return;

                if (screen === "menu") {
                    startLoop("menu-loop", { volume: 0.3 }, true);
                }
                if (screen === "playing") {
                    startLoop("game-loop", { volume: 0.22 }, true);
                }
            }).catch(() => {});
        };

        window.addEventListener("pointerdown", tryUnlock, { once: true });
        return () => window.removeEventListener("pointerdown", tryUnlock);
    }, [screen, isMuted, soundsReady]);

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
        if (typeof window === "undefined") return;
        window.localStorage.setItem(MUTED_STORAGE_KEY, String(isMuted));
    }, [isMuted]);

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

    useEffect(() => {
        if (screen === "menu" && !isMuted && soundsReady) {
            stopLoop("game-loop");
            startLoop("menu-loop", { volume: 0.3 }, true);
        } else {
            stopLoop("menu-loop");
        }
    }, [screen, isMuted, soundsReady]);

    useEffect(() => {
        if (screen === "playing" && !isMuted && soundsReady) {
            stopLoop("menu-loop");
            startLoop("game-loop", { volume: 0.22 }, true);
        } else {
            stopLoop("game-loop");
        }
    }, [screen, isMuted, soundsReady]);

    useEffect(() => {
        if (screen !== "gameOver" || !lastResult) return;

        const key = [
            lastResult.score,
            lastResult.perfectRun,
            lastResult.attemptNumber,
            lastResult.mode,
            lastResult.dateKey,
        ].join("-");

        if (lastUiResultKeyRef.current === key) return;
        lastUiResultKeyRef.current = key;

        if (lastResult.perfectRun) {
            playSound("ui-victory", { volume: 0.55 }, !isMuted);
        } else {
            playSound("ui-defeat", { volume: 0.55 }, !isMuted);
        }
    }, [screen, lastResult, isMuted]);

    const openHelpPanel = async () => {
        await unlockAudio();
        playSound("ui-sound", { volume: 0.5 }, !isMuted);
        setSettingsOpen(false);
        setPanel("help");
    };

    const startGame = async (selectedMode) => {
        await unlockAudio();
        stopAllLoops();

        setMode(selectedMode);
        setSettingsOpen(false);

        if (selectedMode === "daily") {
            playSound("daily-start", { volume: 0.55 }, !isMuted);
        } else {
            playRandomAudio(
                ["endless-start-1", "endless-start-2", "endless-start-3"],
                { volume: 0.55 },
                !isMuted
            );
        }

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

    const retryGame = async () => {
        await unlockAudio();
        stopAllLoops();

        const nextMode = lastResult?.mode ?? mode;
        setMode(nextMode);

        if (nextMode === "daily") {
            const freshTodayKey = getTodayKey();
            const attemptNumber = incrementDailyAttempts(freshTodayKey);
            setCurrentAttemptNumber(attemptNumber);
            playSound("daily-start", { volume: 0.55 }, !isMuted);
        } else {
            setCurrentAttemptNumber(null);
            playRandomAudio(
                ["endless-start-1", "endless-start-2", "endless-start-3"],
                { volume: 0.55 },
                !isMuted
            );
        }

        setSessionId((previous) => previous + 1);
        setScreen("playing");
    };

    const backToMenu = () => {
        setScreen("menu");
        setConfirmExitOpen(false);
        setSettingsOpen(false);
    };

    const handleBrandClick = async () => {
        await unlockAudio();
        playSound("ui-sound", { volume: 0.45 }, !isMuted);

        if (screen === "playing") {
            setConfirmExitOpen(true);
            return;
        }

        setScreen("menu");
        setSettingsOpen(false);
    };

    const confirmExitGame = () => {
        stopAllLoops();
        setConfirmExitOpen(false);
        setScreen("menu");
    };

    return (
        <div className="app-shell" data-theme={theme} data-skin={skin}>
            <Header
                onHelpClick={openHelpPanel}
                onBrandClick={handleBrandClick}
                onOpenSettings={() => setSettingsOpen(true)}
                theme={theme}
                onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                skin={skin}
                onSkinChange={(nextSkin) => {
                    setSkin(nextSkin);
                    playSound("ui-sound", { volume: 0.35 }, !isMuted);
                }}
                language={language}
                onLanguageChange={(nextLanguage) => {
                    setLanguage(nextLanguage);
                    playSound("ui-sound", { volume: 0.35 }, !isMuted);
                }}
                isMuted={isMuted}
                onToggleMute={() => {
                    const nextMuted = !isMuted;
                    setIsMuted(nextMuted);

                    if (nextMuted) {
                        stopAllLoops();
                        return;
                    }

                    unlockAudio().then(() => {
                        playSound("ui-sound", { volume: 0.45 }, true);
                        if (screen === "menu") {
                            startLoop("menu-loop", { volume: 0.3 }, true);
                        } else if (screen === "playing") {
                            startLoop("game-loop", { volume: 0.22 }, true);
                        }
                    });
                }}
                t={t}
            />

            <main className="page-content">
                {screen === "menu" && (
                    <MenuScreen
                        dailyLabel={`${t.daily} • ${todayKey}`}
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
                        soundEnabled={!isMuted}
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

            {settingsOpen && (
                <MobileSettingsPanel
                    onClose={() => setSettingsOpen(false)}
                    onHelpClick={openHelpPanel}
                    theme={theme}
                    onToggleTheme={() => {
                        setTheme((current) => (current === "dark" ? "light" : "dark"));
                        playSound("ui-sound", { volume: 0.35 }, !isMuted);
                    }}
                    skin={skin}
                    onSkinChange={(nextSkin) => {
                        setSkin(nextSkin);
                        playSound("ui-sound", { volume: 0.35 }, !isMuted);
                    }}
                    language={language}
                    onLanguageChange={(nextLanguage) => {
                        setLanguage(nextLanguage);
                        playSound("ui-sound", { volume: 0.35 }, !isMuted);
                    }}
                    isMuted={isMuted}
                    onToggleMute={() => {
                        const nextMuted = !isMuted;
                        setIsMuted(nextMuted);

                        if (nextMuted) {
                            stopAllLoops();
                            return;
                        }

                        unlockAudio().then(() => {
                            playSound("ui-sound", { volume: 0.45 }, true);
                            if (screen === "menu") {
                                startLoop("menu-loop", { volume: 0.3 }, true);
                            } else if (screen === "playing") {
                                startLoop("game-loop", { volume: 0.22 }, true);
                            }
                        });
                    }}
                    t={t}
                />
            )}

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

                            <p className="help-reset-note">
                                {t.helpResetNote(resetCountdownLabel)}
                            </p>

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

