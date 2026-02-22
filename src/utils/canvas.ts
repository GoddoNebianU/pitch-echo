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
            Array.from({ length: 25 }, () => false)
        );
        setWhiteKeysPressed(
            Array.from({ length: 35 }, () => false)
        );
    } else if (key.type === "black") {
        setBlackKeysPressed(
            Array.from({ length: 25 }, (_, i) => i === key.index)
        );
        setWhiteKeysPressed(
            Array.from({ length: 35 }, () => false)
        );
    } else {
        setWhiteKeysPressed(
            Array.from({ length: 35 }, (_, i) => i === key.index)
        );
        setBlackKeysPressed(
            Array.from({ length: 25 }, () => false)
        );
    }

    // mcanvas
    const BLOCK_WIDTH = 6;
    const START_Y = 100;

    const mctx = canvasRef.current?.getContext("2d");
    if (!mctx || !blockQueue.current) {
        if (!mctx) console.error("mctx is null");
        if (!blockQueue.current) console.error("blockQueue.current is null");
        return;
    };
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
        block.len += block.len > 10 ? 0 : 1;
    }
    function getBlockX(block: {
        type: "black" | "white";
        index: number;
        y: number;
        len: number;
    }) {
        if (block.type === "white") {
            return block.index * 24 + 12 - BLOCK_WIDTH / 2;
        }
        const wi = getWhiteKeyIndex(block.index);
        return wi * 24 + 15 + 9 - BLOCK_WIDTH / 2;
    }
    // 删除尾部
    for (const block of blockQueue.current) {
        mctx.clearRect(
            getBlockX(block),
            START_Y + block.y - block.len,
            BLOCK_WIDTH,
            1
        );
    }
    // 绘制
    for (const block of blockQueue.current) {
        mctx.fillStyle = block.type === "white" ? "blue" : "green";
        // mctx.fillStyle = `rgba(${block.type === "white" ? "0, 0, 255" : "0, 255, 0"}, ${BLOCK_OPACITY})`;
        mctx.fillRect(
            getBlockX(block),
            START_Y + block.y,
            BLOCK_WIDTH,
            1
        );
    }
    // 清理
    if (l > 2 && blockQueue.current[l - 2].y > 400) {
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
    // acanvas
    const BLOCK_WIDTH = 15;
    const START_Y = 0;
    const BLOCK_OPACITY = 0.5;
    const l = blockQueue.current.length;

    if (playBeginTime) {
        const totalTime = pitchList.length * (1 / 60);
        const index = nearestFrameIndex((Date.now() - playBeginTime) / 1000, totalTime, 60);
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
    if (!mctx || !blockQueue.current) {
        if (!mctx) console.error("mctx is null");
        if (!blockQueue.current) console.error("blockQueue.current is null");
        return;
    };

    for (const block of blockQueue.current) {
        // 下移
        block.y++;
        block.len += block.len > 10 ? 0 : 1;
    }
    function getBlockX(block: {
        type: "black" | "white";
        index: number;
        y: number;
        len: number;
    }) {
        if (block.type === "white") {
            return block.index * 24 + 12 - BLOCK_WIDTH / 2;
        }
        const wi = getWhiteKeyIndex(block.index);
        return wi * 24 + 15 + 9 - BLOCK_WIDTH / 2;
    }
    // 删除尾部
    for (const block of blockQueue.current) {
        mctx.clearRect(
            getBlockX(block),
            START_Y + block.y - block.len,
            BLOCK_WIDTH,
            1
        );
    }
    // 绘制
    for (const block of blockQueue.current) {
        mctx.fillStyle = `rgba(${block.type === "white" ? "0, 0, 255" : "0, 255, 0"}, ${BLOCK_OPACITY})`;
        mctx.fillRect(
            getBlockX(block),
            START_Y + block.y,
            BLOCK_WIDTH,
            1
        );
    }
    // 清理
    if (l > 2 && blockQueue.current[l - 2].y > 400) {
        blockQueue.current = blockQueue.current.splice(l - 2);
    }
}