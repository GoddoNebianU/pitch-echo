import { useCallback, useState, useRef } from "react";
import { PitchDetector } from "pitchy";
import { MAX_FREQ, MIN_FREQ, PITCH_SMOOTHING_ATTENUATION_COEFFICIENT, PITCH_SMOOTHING_WINDOW } from "./config";
import { useGlobalStore } from "../globalStore";

interface PitchResult {
    pitch: number;
    volume: number;
}

export function useMicPitch() {
    const [pitchResult, setPitchResult] = useState<PitchResult>({ pitch: -1, volume: -Infinity });
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const pitchHistoryRef = useRef<number[]>([]);
    const {
        dbThreshold
    } = useGlobalStore();

    // const smoothPitch = (newPitch: number) => {
    //     const ph = pitchHistoryRef.current;
    //     ph.push(newPitch);
    //     if (ph.length > PITCH_SMOOTHING_WINDOW) {
    //         ph.shift();
    //     }
    //     const N = ph.length;
    //     const ws = Array.from({ length: N }).map((_, i) => {
    //         return Math.pow(1 - PITCH_SMOOTHING_ATTENUATION_COEFFICIENT, N - i);
    //     });
    //     const result = ph.reduce((p, v, i) => {
    //         return p + v * ws[i];
    //     }) / ws.reduce((p, v) => p + v);
    //     ph.shift();
    //     ph.push(result);
    //     return result;
    // };

    const smoothPitch = (newPitch: number) => {
        const ph = pitchHistoryRef.current;
        ph.push(newPitch);
        if (ph.length > PITCH_SMOOTHING_WINDOW) {
            ph.shift();
        }
        const N = ph.length;
        const ws = Array.from({ length: N }).map((_, i) => {
            return Math.pow(1 - PITCH_SMOOTHING_ATTENUATION_COEFFICIENT, N - i);
        });
        return ph.reduce((p, v, i) => {
            return p + v * ws[i];
        }) / ws.reduce((p, v) => p + v);
    };

    const calculateVolume = (input: Float32Array): number => {
        let sum = 0;
        for (let i = 0; i < input.length; i++) {
            sum += input[i] * input[i];
        }
        const rms = Math.sqrt(sum / input.length);
        return 20 * Math.log10(rms);
    };

    const mInit = () => {
        const audioContext = new window.AudioContext();
        const analyserNode = audioContext.createAnalyser();
        audioContextRef.current = audioContext;

        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            streamRef.current = stream;
            audioContext.createMediaStreamSource(stream).connect(analyserNode);
            const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
            detector.minVolumeDecibels = -1000;
            const input = new Float32Array(detector.inputLength);

            const updatePitch = () => {
                analyserNode.getFloatTimeDomainData(input);
                const volume = calculateVolume(input);

                if (volume < dbThreshold) {
                    setPitchResult({ pitch: -1, volume });
                    animationFrameRef.current = requestAnimationFrame(updatePitch);
                    return;
                }

                const [pitch] = detector.findPitch(input, audioContext.sampleRate);

                if (pitch < MIN_FREQ || pitch > MAX_FREQ) {
                    console.log(pitch);
                    animationFrameRef.current = requestAnimationFrame(updatePitch);
                    return;
                };

                const smoothedPitch = smoothPitch(pitch);

                setPitchResult({ pitch: smoothedPitch, volume });
                animationFrameRef.current = requestAnimationFrame(updatePitch);
                return;
            };
            updatePitch();
        });
    };

    const mCleanup = useCallback(() => {
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        pitchHistoryRef.current = [];
        setPitchResult({ pitch: -1, volume: -Infinity });
    }, []);

    return { pitchResult, mInit, mCleanup };
}
