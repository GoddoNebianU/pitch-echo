import { getKeyByFreq } from "./piano";

/**
 * 给定时间 t，返回最近采样点的索引
 */
export function nearestFrameIndex(
    t: number,
    duration: number,
    fps: number): number {
    if (fps <= 0) throw new Error("fps must be > 0");

    // 总帧数（最后一帧的 index）
    const maxIndex = Math.floor(duration * fps);

    // clamp 时间
    const clamped = Math.max(0, Math.min(t, duration));

    // 最近帧
    const index = Math.round(clamped * fps);

    // 防止越界
    return Math.max(0, Math.min(index, maxIndex));
}export const findNearestKey = (pitch: number) => {
    const n = getKeyByFreq(pitch) - 1 - 15;
    if (n < 0) return 0;

    if ([1, 3, 6, 8, 10].includes(n % 12)) {
        // 黑键
        return {
            type: "black",
            index: {
                1: 0,
                3: 1,
                6: 2,
                8: 3,
                10: 4
            }[n % 12]! + Math.floor(n / 12) * 5
        };
    } else {
        // 白键
        return {
            type: "white",
            index: {
                0: 0,
                2: 1,
                4: 2,
                5: 3,
                7: 4,
                9: 5,
                11: 6
            }[n % 12]! + Math.floor(n / 12) * 7
        };
    }
};

