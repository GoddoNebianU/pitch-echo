import { useState } from "react";
import { PitchDetector } from "pitchy";
import { AUDIO_FILE_FPS, MIN_VOLUME_DECIBELS_A } from "./config";

export function useAudioFilePitch(url: string) {
  const [pitchList, setPitchList] = useState<number[]>([]);

  const aInit = () => {
    (async () => {
      const audioContext = new AudioContext();

      // 1️⃣ 拉取并解码
      const res = await fetch(url);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;

      // 时间步长
      const targetFPS = AUDIO_FILE_FPS;
      const hop = sampleRate / targetFPS; // 每帧间隔（采样点）

      // pitchy detector
      const detector = PitchDetector.forFloat32Array(1024);
      detector.minVolumeDecibels = MIN_VOLUME_DECIBELS_A;
      const input = new Float32Array(detector.inputLength);

      const pitches: number[] = [];

      // 2️⃣ 按时间均匀采样
      for (
        let pos = 0;
        pos + detector.inputLength < channelData.length;
        pos += hop
      ) {
        const start = Math.floor(pos);
        input.set(
          channelData.subarray(start, start + detector.inputLength)
        );

        const [pitch] = detector.findPitch(input, sampleRate);
        pitches.push(pitch || 0);
      }
      setPitchList(pitches);
    })();
  };

  return { pitchList, aInit };
}