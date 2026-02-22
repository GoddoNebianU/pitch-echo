import { useState } from "react";
import { PitchDetector } from "pitchy";

export function useMicPitch() {
    const [mPitch, setMPitch] = useState(-1);

    const mInit = () => {
        const audioContext = new window.AudioContext();
        const analyserNode = audioContext.createAnalyser();

        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            audioContext.createMediaStreamSource(stream).connect(analyserNode);
            const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
            detector.minVolumeDecibels = -10;
            const input = new Float32Array(detector.inputLength);

            const updatePitch = () => {
                analyserNode.getFloatTimeDomainData(input);
                const pitch = detector.findPitch(input, audioContext.sampleRate)[0];

                setMPitch(pitch);
                window.setTimeout(
                    () => updatePitch(),
                    1000 / 24,
                );
            };
            updatePitch();
        });
    };
    return { mPitch, mInit };
}
