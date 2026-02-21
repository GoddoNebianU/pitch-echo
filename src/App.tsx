import { useEffect, useRef, useState } from "react";
import { cn } from "./utils/cn";
import { useMicPitch } from "./lib/usePitchy";
import { getKeyByFreq } from "./utils/piano";


const getBlackKeyIndex = (whiteKeyIndex: number) => Math.floor(whiteKeyIndex / 7) * 5 +
    {
        0: 0,
        1: 1,
        3: 2,
        4: 3,
        5: 4
    }[whiteKeyIndex % 7]!;

const getWhiteKeyIndex = (blackKeyIndex: number) => Math.floor(blackKeyIndex / 5) * 7 +
    {
        0: 0,
        1: 1,
        2: 3,
        3: 4,
        4: 5
    }[blackKeyIndex % 5]!;

const findNearestKey = (pitch: number) => {
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

export default function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const blockQueue = useRef<Array<{
        "type": "white" | "black";
        "index": number;
        "y": number;
        "len": number;
    }>>([{
        type: "black",
        index: 4,
        y: 0,
        len: 100
    }]);
    const { mPitch, mInit } = useMicPitch();

    const [whiteKeysPressed, setWhiteKeysPressed] = useState(() =>
        Array.from({ length: 35 }, () => false)
        // .map((v, i) => i === 4 && true || v)
    );
    const [blackKeysPressed, setBlackKeysPressed] = useState(() =>
        Array.from({ length: 25 }, () => false)
        // .map((v, i) => i === 5 && true || v)
    );

    useEffect(() => {
        setTimeout(() => {
            const key = findNearestKey(mPitch);
            // const key = findNearestKey(554);

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

            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx || !blockQueue.current) return;
            const KEY_WIDTH = 6;
            const START_Y = 100;

            const lastBlock = blockQueue.current[blockQueue.current.length - 1];
            if (key !== 0) {
                if (key.index === lastBlock.index && key.type === lastBlock.type) {
                    lastBlock.len++;
                } else {
                    blockQueue.current.push({
                        type: key.type as "white" | "black",
                        index: key.index,
                        y: 0,
                        len: 0
                    });
                }
            }
            for (const block of blockQueue.current) {
                block.y++;
                block.len += block.len > 10 ? 0 : 1;
            }
            for (const block of blockQueue.current) {
                if (block.type === "white") {
                    ctx.clearRect(block.index * 24 + 12 - KEY_WIDTH / 2, START_Y + block.y - block.len, KEY_WIDTH, 1);
                } else {
                    const wi = getWhiteKeyIndex(block.index);
                    ctx.clearRect(wi * 24 + 15 + 9 - KEY_WIDTH / 2, START_Y + block.y - block.len, KEY_WIDTH, 1);
                }
            }
            for (const block of blockQueue.current) {
                // if (block.len < 10) continue;

                if (block.type === "white") {
                    ctx.fillStyle = "blue";
                    ctx.fillRect(block.index * 24 + 12 - KEY_WIDTH / 2, START_Y + block.y, KEY_WIDTH, 1);
                } else {
                    const wi = getWhiteKeyIndex(block.index);
                    ctx.fillStyle = "green";
                    ctx.fillRect(wi * 24 + 15 + 9 - KEY_WIDTH / 2, START_Y + block.y, KEY_WIDTH, 1);
                }
            }
            const l = blockQueue.current.length;
            if (blockQueue.current[l - 2].y > 400) {
                blockQueue.current = blockQueue.current.splice(l - 2);
            }
        }, 0);
    }, [mPitch]);

    return (
        <div className={cn("shadow w-10/12 mt-4 p-2 mx-auto",
            "flex flex-col justify-center items-center gap-2"
        )}>
            <h1 className="font-bold text-2xl">pitch echo</h1>
            <div className="border flex flex-col">
                {/* c2->b6 */}
                <div className="h-32 flex">
                    {
                        whiteKeysPressed.map((v: boolean, i) => {
                            return <div
                                className={cn(
                                    "w-[24px] h-full box-border border relative",
                                    { "bg-gray-400": v }
                                )}
                                key={"white_key_" + i}>
                                <span className="bottom-0 absolute">
                                    {i % 7 === 0 && `C${Math.floor(i / 7) + 2}`}
                                </span>
                                {i % 7 !== 2 && i % 7 !== 6 &&
                                    <div key={`black_key_${getBlackKeyIndex(i)}`}
                                        className={cn(
                                            "z-10 bg-black box-border border absolute h-8/12 w-[18px] top-0 left-[15px]",
                                            { "bg-gray-400": blackKeysPressed[getBlackKeyIndex(i)] })}>
                                    </div>
                                }
                            </div>;
                        })
                    }
                </div>
                <canvas
                    width={840}
                    height={400}
                    ref={canvasRef}>Your browser does not support canvas.</canvas>
            </div>
            {mPitch === -1 && <div>
                <label>record</label>
                <input type="checkbox" onChange={e => {
                    if (e.target.checked) {
                        mInit();
                    }
                }} />
            </div>}
        </div>
    );
}
