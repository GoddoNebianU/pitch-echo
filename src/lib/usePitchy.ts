import { useState } from "react";
import { PitchDetector } from "pitchy";

export function usePitchy() {
    const [pitch, setPitch] = useState(-1);

    const init = () => {
        const audioContext = new window.AudioContext();
        const analyserNode = audioContext.createAnalyser();

        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            audioContext.createMediaStreamSource(stream).connect(analyserNode);
            const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
            detector.minVolumeDecibels = -50;
            const input = new Float32Array(detector.inputLength);

            const updatePitch = () => {
                analyserNode.getFloatTimeDomainData(input);
                const pitch = detector.findPitch(input, audioContext.sampleRate)[0];

                setPitch(pitch);
                window.setTimeout(
                    () => updatePitch(),
                    1 / 24,
                );
            };
            updatePitch();
        });
    };
    return { pitch, init };
}
