const DIRECTIONS = ["up", "right", "down", "left"];
const PARIS_TIMEZONE = "Europe/Paris";

function hashString(value) {
    let hash = 1779033703 ^ value.length;

    for (let index = 0; index < value.length; index += 1) {
        hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
        hash = (hash << 13) | (hash >>> 19);
    }

    return hash >>> 0;
}

function mulberry32(seed) {
    return function random() {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function getTimeZoneParts(date, timeZone) {
    const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const map = {};

    for (const part of parts) {
        if (part.type !== "literal") {
            map[part.type] = part.value;
        }
    }

    return {
        year: Number(map.year),
        month: Number(map.month),
        day: Number(map.day),
        hour: Number(map.hour),
        minute: Number(map.minute),
        second: Number(map.second),
    };
}

function getTimeZoneOffsetMs(date, timeZone) {
    const parts = getTimeZoneParts(date, timeZone);
    const utcFromLocalView = Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second
    );

    return utcFromLocalView - date.getTime();
}

export function getTodayKey() {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: PARIS_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    return formatter.format(new Date());
}

export function getMsUntilNextParisMidnight(fromDate = new Date()) {
    const parisNow = getTimeZoneParts(fromDate, PARIS_TIMEZONE);

    const nextParisDay = new Date(
        Date.UTC(parisNow.year, parisNow.month - 1, parisNow.day, 12, 0, 0)
    );
    nextParisDay.setUTCDate(nextParisDay.getUTCDate() + 1);

    const nextYear = nextParisDay.getUTCFullYear();
    const nextMonth = nextParisDay.getUTCMonth() + 1;
    const nextDay = nextParisDay.getUTCDate();

    const midnightGuessUtcMs = Date.UTC(nextYear, nextMonth - 1, nextDay, 0, 0, 0);
    const offsetMs = getTimeZoneOffsetMs(new Date(midnightGuessUtcMs), PARIS_TIMEZONE);
    const actualMidnightUtcMs = midnightGuessUtcMs - offsetMs;

    return Math.max(0, actualMidnightUtcMs - fromDate.getTime());
}

export function formatResetCountdown(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
    ].join(":");
}

export function generateSequenceFromSeed(seedValue, length = 100) {
    const seed = hashString(seedValue);
    const random = mulberry32(seed);

    return Array.from({ length }, () => {
        const index = Math.floor(random() * DIRECTIONS.length);
        return DIRECTIONS[index];
    });
}

export function generateDailySequence(length = 100) {
    const dateKey = getTodayKey();

    return {
        sequence: generateSequenceFromSeed(`daily-paris-${dateKey}`, length),
        dateKey,
    };
}

export function generateEndlessSequence(length = 100) {
    const seed = `endless-${Date.now()}-${Math.random()}`;
    return generateSequenceFromSeed(seed, length);
}