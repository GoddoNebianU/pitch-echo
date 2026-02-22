import { AUDIO_FILE_FPS, BLACK_KEY_COUNT, BLOCK_BLACK_WIDTH_A, BLOCK_BLACK_WIDTH_M, BLOCK_COLOR_BLACK_A, BLOCK_COLOR_BLACK_M, BLOCK_COLOR_WHITE_A, BLOCK_COLOR_WHITE_M, BLOCK_LEN_MIN, BLOCK_WHITE_WIDTH_A, BLOCK_WHITE_WIDTH_M, CANVAS_HEIGHT, SONG_DELAY_MS, START_Y_A, START_Y_M, WHITE_KEY_COUNT, WHITE_KEY_WIDTH } from "../lib/config";
import { findNearestKey, nearestFrameIndex } from "./audio";

export const getBlackKeyIndex = (whiteKeyIndex: number) => Math.floor(whiteKeyIndex / 7) * 5 +
    {
        0: 0,
        1: 1,
        3: 2,
        4: 3,
        5: 4
    }[whiteKeyIndex % 7]!;
export const getWhiteKeyIndex = (blackKeyIndex: number) => Math.floor(blackKeyIndex / 5) * 7 +
    {
        0: 0,
        1: 1,
        2: 3,
        3: 4,
        4: 5
    }[blackKeyIndex % 5]!;

function getBlockX(block: {
    type: "black" | "white";
    index: number;
    y: number;
    len: number;
}) {
    if (block.type === "white") {
        return block.index * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH - BLOCK_BLACK_WIDTH_M / 2;
    }
    const wi = getWhiteKeyIndex(block.index);
    return wi * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH - BLOCK_WHITE_WIDTH_M / 2;
}

export function mCanvasDraw({
    pitch,
    canvasRef,
    setWhiteKeysPressed,
    setBlackKeysPressed,
    blockQueue
}: {
    pitch: number;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    setWhiteKeysPressed: React.Dispatch<React.SetStateAction<boolean[]>>;
    setBlackKeysPressed: React.Dispatch<React.SetStateAction<boolean[]>>;
    blockQueue: React.RefObject<{
        type: "white" | "black";
        index: number;
        y: number;
        len: number;
    }[]>;
}) {
    const key = findNearestKey(pitch);

    // 键盘按键变色
    if (key === 0) {
        setBlackKeysPressed(
            Array.from({ length: BLACK_KEY_COUNT }, () => false)
        );
        setWhiteKeysPressed(
            Array.from({ length: WHITE_KEY_COUNT }, () => false)
        );
    } else if (key.type === "black") {
        setBlackKeysPressed(
            Array.from({ length: BLACK_KEY_COUNT }, (_, i) => i === key.index)
        );
        setWhiteKeysPressed(
            Array.from({ length: WHITE_KEY_COUNT }, () => false)
        );
    } else {
        setWhiteKeysPressed(
            Array.from({ length: WHITE_KEY_COUNT }, (_, i) => i === key.index)
        );
        setBlackKeysPressed(
            Array.from({ length: BLACK_KEY_COUNT }, () => false)
        );
    }

    const mctx = canvasRef.current?.getContext("2d");
    if (!mctx || !blockQueue.current) return;
    const l = blockQueue.current.length;
    if (key !== 0) {
        const lastBlock = blockQueue.current[l - 1];
        if (lastBlock && key.index === lastBlock.index && key.type === lastBlock.type) {
            // key重复就加长
            lastBlock.len++;
        } else {
            // 否则新建块
            blockQueue.current.push({
                type: key.type as "white" | "black",
                index: key.index,
                y: 0,
                len: 0
            });
        }
    }
    for (const block of blockQueue.current) {
        // 下移
        block.y++;
        block.len += block.len > BLOCK_LEN_MIN ? 0 : 1;
    }

    // 删除尾部
    for (const block of blockQueue.current) {
        mctx.clearRect(
            getBlockX(block),
            START_Y_M + block.y - block.len,
            block.type === "white" ? BLOCK_WHITE_WIDTH_M : BLOCK_BLACK_WIDTH_M,
            1
        );
    }
    // 绘制
    for (const block of blockQueue.current) {
        mctx.fillStyle = block.type === "white" ? BLOCK_COLOR_WHITE_M : BLOCK_COLOR_BLACK_M;
        // mctx.fillStyle = `rgba(${block.type === "white" ? "0, 0, 255" : "0, 255, 0"}, ${BLOCK_OPACITY})`;
        mctx.fillRect(
            getBlockX(block),
            START_Y_M + block.y,
            block.type === "white" ? BLOCK_WHITE_WIDTH_M : BLOCK_BLACK_WIDTH_M,
            1
        );
    }
    // 清理
    if (l > 2 && blockQueue.current[l - 2].y > CANVAS_HEIGHT) {
        blockQueue.current = blockQueue.current.splice(l - 2);
    }
}

export function aCanvasDraw({
    canvasRef,
    blockQueue,
    playBeginTime,
    pitchList
}: {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    blockQueue: React.RefObject<{
        type: "white" | "black";
        index: number;
        y: number;
        len: number;
    }[]>;
    playBeginTime: null | number;
    pitchList: number[];
}) {
    const l = blockQueue.current.length;

    if (playBeginTime) {
        const totalTime = pitchList.length * (1 / AUDIO_FILE_FPS);
        const index = nearestFrameIndex((Date.now() - SONG_DELAY_MS - playBeginTime) / 1000, totalTime, AUDIO_FILE_FPS);
        const key = findNearestKey(pitchList[index]);

        if (key !== 0) {
            const lastBlock = blockQueue.current[l - 1];
            if (lastBlock && key.index === lastBlock.index && key.type === lastBlock.type) {
                // key重复就加长
                lastBlock.len++;
            } else {
                // 否则新建块
                blockQueue.current.push({
                    type: key.type as "white" | "black",
                    index: key.index,
                    y: 0,
                    len: 0
                });
            }
        }
    }

    const mctx = canvasRef.current?.getContext("2d");
    if (!mctx || !blockQueue.current) return;

    for (const block of blockQueue.current) {
        // 下移
        block.y++;
        block.len += block.len > BLOCK_LEN_MIN ? 0 : 1;
    }
    // 删除尾部
    for (const block of blockQueue.current) {
        mctx.clearRect(
            getBlockX(block),
            START_Y_A + block.y - block.len,
            block.type === "white" ? BLOCK_WHITE_WIDTH_A : BLOCK_BLACK_WIDTH_A,
            1
        );
    }
    // 绘制
    for (const block of blockQueue.current) {
        mctx.fillStyle = block.type === "white" ? BLOCK_COLOR_WHITE_A : BLOCK_COLOR_BLACK_A;
        mctx.fillRect(
            getBlockX(block),
            START_Y_A + block.y,
            block.type === "white" ? BLOCK_WHITE_WIDTH_A : BLOCK_BLACK_WIDTH_A,
            1
        );
    }
    // 清理
    if (l > 2 && blockQueue.current[l - 2].y > CANVAS_HEIGHT) {
        blockQueue.current = blockQueue.current.splice(l - 2);
    }
}