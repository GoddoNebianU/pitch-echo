import { getFreqOfKey } from "../utils/piano";

export const MIN_KEY_INDEX = 15; // C2->B6 只支持Cn1到Bn2，n2>n1
export const MAX_KEY_INDEX = 74;

export const MIN_FREQ = getFreqOfKey(MIN_KEY_INDEX - 1);
export const MAX_FREQ = getFreqOfKey(MAX_KEY_INDEX + 1);

export const KEY_COUNT = MAX_KEY_INDEX - MIN_KEY_INDEX + 1;
export const WHITE_KEY_COUNT = KEY_COUNT / 12 * 7;
export const BLACK_KEY_COUNT = KEY_COUNT / 12 * 5;

export const WHITE_KEY_WIDTH = 24;
export const BLACK_KEY_WIDTH = 18;

export const CANVAS_WIDTH = WHITE_KEY_COUNT * WHITE_KEY_WIDTH;
export const CANVAS_HEIGHT = 380;

export const DEFAULT_SONG_URL = "./02.mp3";

export const AUDIO_FILE_FPS = 60;
export const MIC_FPS = 24;

export const MIN_VOLUME_DECIBELS_A = -30;
export const MIN_VOLUME_DECIBELS_M = -10;

export const PITCH_SMOOTHING_ATTENUATION_COEFFICIENT = 0.02;
export const PITCH_SMOOTHING_WINDOW = (() => {
    const alpha = PITCH_SMOOTHING_ATTENUATION_COEFFICIENT;
    const t = 1 - alpha;
    const m = 0.05;
    return -Math.round(
        Math.log((m * t - t + 1) / (m * t))
        / Math.log(t)
    );
})();

export const BLOCK_WHITE_WIDTH_M = 5;
export const BLOCK_BLACK_WIDTH_M = 5;
export const BLOCK_WHITE_WIDTH_A = 15;
export const BLOCK_BLACK_WIDTH_A = 15;

export const BLOCK_LEN_MIN = 5;

export const BLOCK_COLOR_WHITE_M = "gray";
export const BLOCK_COLOR_BLACK_M = "gray";
export const BLOCK_COLOR_WHITE_A = "#ff00ff";
export const BLOCK_COLOR_BLACK_A = "#ff00ff";

// export const START_Y_M = 150;
export const START_Y_M = 0;
export const START_Y_A = 0;

export const SONG_DELAY_MS = 0;

export const ENABLE_AUDIO = false;
