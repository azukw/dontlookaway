const AudioContextClass = window.AudioContext || window.webkitAudioContext;

let audioContext = null;
const buffers = new Map();
const activeLoops = new Map();

function getAudioContext() {
    if (!audioContext) {
        audioContext = new AudioContextClass();
    }

    return audioContext;
}

export async function unlockAudio() {
    const context = getAudioContext();

    if (context.state === "suspended") {
        await context.resume();
    }

    return context;
}

export async function loadSound(name, url) {
    if (buffers.has(name)) {
        return buffers.get(name);
    }

    const context = getAudioContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    buffers.set(name, audioBuffer);
    return audioBuffer;
}

export async function preloadSounds(definitions) {
    await Promise.all(
        definitions.map(({ name, url }) => loadSound(name, url))
    );
}

export function playSound(name, options = {}, enabled = true) {
    if (!enabled) return null;

    const context = getAudioContext();
    const buffer = buffers.get(name);

    if (!buffer) return null;

    if (context.state === "suspended") {
        context.resume().catch(() => {});
    }

    const source = context.createBufferSource();
    const gainNode = context.createGain();

    source.buffer = buffer;
    source.playbackRate.value = options.playbackRate ?? 1;
    gainNode.gain.value = options.volume ?? 1;

    source.connect(gainNode);
    gainNode.connect(context.destination);
    source.start(0);

    return source;
}

export const playAudio = playSound;

export function playRandomSound(names, options = {}, enabled = true) {
    if (!enabled || !names?.length) return null;
    const name = names[Math.floor(Math.random() * names.length)];
    return playSound(name, options, enabled);
}

export const playRandomAudio = playRandomSound;

export function startLoop(name, options = {}, enabled = true) {
    if (!enabled) return null;

    const context = getAudioContext();
    const buffer = buffers.get(name);

    if (!buffer) return null;

    const existing = activeLoops.get(name);
    if (existing) {
        if (options.volume != null) {
            existing.gainNode.gain.value = options.volume;
        }
        if (options.playbackRate != null && existing.source?.playbackRate) {
            existing.source.playbackRate.value = options.playbackRate;
        }
        return existing.source;
    }

    if (context.state === "suspended") {
        context.resume().catch(() => {});
    }

    const source = context.createBufferSource();
    const gainNode = context.createGain();

    source.buffer = buffer;
    source.loop = true;
    source.playbackRate.value = options.playbackRate ?? 1;
    gainNode.gain.value = options.volume ?? 1;

    source.connect(gainNode);
    gainNode.connect(context.destination);
    source.start(0);

    activeLoops.set(name, { source, gainNode });

    return source;
}

export function stopLoop(name) {
    const active = activeLoops.get(name);

    if (!active) return;

    try {
        active.source.stop(0);
    } catch { /* empty */ }

    active.source.disconnect();
    active.gainNode.disconnect();
    activeLoops.delete(name);
}

export function stopAllLoops() {
    Array.from(activeLoops.keys()).forEach(stopLoop);
}