import { useCallback, useState, useRef } from "react";
import { PitchDetector } from "pitchy";
import { MIN_VOLUME_DECIBELS_M, PITCH_SMOOTHING } from "./config";

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

    const smoothPitch = (newPitch: number): number => {
        pitchHistoryRef.current.push(newPitch);
        if (pitchHistoryRef.current.length > PITCH_SMOOTHING) {
            pitchHistoryRef.current.shift();
        }
        return pitchHistoryRef.current.reduce((a, b) => a + b) / pitchHistoryRef.current.length;
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
            detector.minVolumeDecibels = MIN_VOLUME_DECIBELS_M;
            const input = new Float32Array(detector.inputLength);

            const updatePitch = () => {
                analyserNode.getFloatTimeDomainData(input);
                const volume = calculateVolume(input);

                if (volume < MIN_VOLUME_DECIBELS_M) {
                    setPitchResult({ pitch: -1, volume });
                    animationFrameRef.current = requestAnimationFrame(updatePitch);
                    return;
                }

                const [pitch] = detector.findPitch(input, audioContext.sampleRate);
                const smoothedPitch = smoothPitch(pitch);

                setPitchResult({ pitch: smoothedPitch, volume });
                animationFrameRef.current = requestAnimationFrame(updatePitch);
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
