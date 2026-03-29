import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowPad } from "../components/ArrowPad";
import { SequenceDisplay } from "../components/SequenceDisplay";
import { useKeyboardInput } from "../hooks/useKeyboardInput";
import { useSwipeInput } from "../hooks/useSwipeInput";
import { generateDailySequence, generateTrainingSequence } from "../utils/generateSequence";

function getShowDuration(round) {
    return Math.max(105, 210 - round * 1.5);
}

function buildRunMetrics(stats) {
    const avgInputMs = stats.correctInputs
        ? Math.round(stats.totalReactionMs / stats.correctInputs)
        : 0;

    const inputsPerSecond = avgInputMs
        ? Number((1000 / avgInputMs).toFixed(2))
        : 0;

    const accuracy = stats.totalAttempts
        ? Number(((stats.correctInputs / stats.totalAttempts) * 100).toFixed(1))
        : 100;

    return {
        totalCorrectInputs: stats.correctInputs,
        totalAttempts: stats.totalAttempts,
        totalInputTimeMs: Math.round(stats.totalReactionMs),
        avgInputMs,
        inputsPerSecond,
        accuracy,
    };
}

export function GameScreen({ mode, onGameOver, t }) {
    const gameAreaRef = useRef(null);
    const timeoutIds = useRef([]);
    const statsRef = useRef({
        correctInputs: 0,
        totalAttempts: 0,
        totalReactionMs: 0,
    });
    const lastInputAtRef = useRef(0);

    const [sequence, setSequence] = useState([]);
    const [dateKey, setDateKey] = useState(undefined);
    const [phase, setPhase] = useState("showing");
    const [currentRound, setCurrentRound] = useState(1);
    const [playerIndex, setPlayerIndex] = useState(0);
    const [flashDirection, setFlashDirection] = useState(null);
    const [errorDirection, setErrorDirection] = useState(null);
    const [flashPulseKey, setFlashPulseKey] = useState(0);

    const wait = (ms) =>
        new Promise((resolve) => {
            const id = window.setTimeout(resolve, ms);
            timeoutIds.current.push(id);
        });

    const pulseDirection = useCallback((direction) => {
        setFlashDirection(direction);
        setFlashPulseKey((value) => value + 1);
    }, []);

    useEffect(() => {
        return () => {
            timeoutIds.current.forEach((id) => window.clearTimeout(id));
            timeoutIds.current = [];
        };
    }, []);

    useEffect(() => {
        statsRef.current = {
            correctInputs: 0,
            totalAttempts: 0,
            totalReactionMs: 0,
        };

        if (mode === "daily") {
            const dailyData = generateDailySequence(100);
            setSequence(dailyData.sequence);
            setDateKey(dailyData.dateKey);
        } else {
            setSequence(generateTrainingSequence(100));
            setDateKey(undefined);
        }

        setPhase("showing");
        setCurrentRound(1);
        setPlayerIndex(0);
        setFlashDirection(null);
        setErrorDirection(null);
        setFlashPulseKey(0);
    }, [mode]);

    useEffect(() => {
        if (sequence.length === 0 || phase !== "showing") {
            return;
        }

        let cancelled = false;

        const playSequence = async () => {
            setFlashDirection(null);
            setErrorDirection(null);

            await wait(140);

            for (let index = 0; index < currentRound; index += 1) {
                if (cancelled) return;

                pulseDirection(sequence[index]);
                await wait(getShowDuration(currentRound));
            }

            if (cancelled) return;

            setFlashDirection(null);
            setPlayerIndex(0);
            lastInputAtRef.current = performance.now();
            setPhase("input");
        };

        playSequence();

        return () => {
            cancelled = true;
        };
    }, [currentRound, phase, pulseDirection, sequence]);

    const finishRun = useCallback(
        (baseResult) => {
            onGameOver({
                ...baseResult,
                ...buildRunMetrics(statsRef.current),
            });
        },
        [onGameOver]
    );

    const handleDirection = useCallback(
        (direction) => {
            if (phase !== "input" || sequence.length === 0) {
                return;
            }

            const expectedDirection = sequence[playerIndex];
            if (!expectedDirection) return;

            const now = performance.now();
            statsRef.current.totalAttempts += 1;

            if (direction === expectedDirection) {
                const reactionMs = now - lastInputAtRef.current;
                statsRef.current.correctInputs += 1;
                statsRef.current.totalReactionMs += reactionMs;
                lastInputAtRef.current = now;

                pulseDirection(direction);

                const clearFlashTimeout = window.setTimeout(() => {
                    setFlashDirection((current) =>
                        current === direction ? null : current
                    );
                }, 110);

                timeoutIds.current.push(clearFlashTimeout);

                const nextIndex = playerIndex + 1;

                if (nextIndex === currentRound) {
                    setPhase("transition");

                    if (currentRound === sequence.length) {
                        const perfectTimeout = window.setTimeout(() => {
                            finishRun({
                                score: sequence.length,
                                roundReached: sequence.length,
                                mode,
                                dateKey,
                                perfectRun: true,
                            });
                        }, 180);

                        timeoutIds.current.push(perfectTimeout);
                        return;
                    }

                    const nextRoundTimeout = window.setTimeout(() => {
                        setPlayerIndex(0);
                        setCurrentRound((round) => round + 1);
                        setPhase("showing");
                    }, 150);

                    timeoutIds.current.push(nextRoundTimeout);
                    return;
                }

                setPlayerIndex(nextIndex);
                return;
            }

            setErrorDirection(direction);
            setPhase("gameOver");

            const gameOverTimeout = window.setTimeout(() => {
                finishRun({
                    score: currentRound - 1,
                    roundReached: currentRound,
                    mode,
                    dateKey,
                    perfectRun: false,
                });
            }, 240);

            timeoutIds.current.push(gameOverTimeout);
        },
        [
            currentRound,
            dateKey,
            finishRun,
            mode,
            phase,
            playerIndex,
            pulseDirection,
            sequence,
        ]
    );

    useKeyboardInput({
        active: phase === "input",
        onDirection: handleDirection,
    });

    useSwipeInput({
        active: phase === "input",
        targetRef: gameAreaRef,
        onDirection: handleDirection,
    });

    return (
        <section className="card game-card" ref={gameAreaRef}>
            <div className="game-topline">
                <span>{mode === "daily" ? `Daily • ${dateKey}` : t.endless}</span>
                <span>
          {t.roundLabel} {currentRound}
        </span>
            </div>

            <SequenceDisplay
                phase={phase}
                flashDirection={flashDirection}
                errorDirection={errorDirection}
                currentRound={currentRound}
                playerIndex={playerIndex}
                flashPulseKey={flashPulseKey}
                t={t}
            />

            <ArrowPad
                disabled={phase !== "input"}
                activeDirection={flashDirection}
                errorDirection={errorDirection}
                activePulseKey={flashPulseKey}
                onDirection={handleDirection}
            />

            <p className="game-help">{t.keyboardHelp}</p>
        </section>
    );
}