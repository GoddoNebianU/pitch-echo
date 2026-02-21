import { useEffect, useState } from "react";
import { cn } from "./utils/cn";
import { usePitchy } from "./lib/usePitchy";
import { getKeyByFreq } from "./utils/piano";


const getBlackKeyIndex = (whiteKeyIndex: number) => Math.floor(whiteKeyIndex / 7) * 5 +
    {
        0: 0,
        1: 1,
        3: 2,
        4: 3,
        5: 4
    }[whiteKeyIndex % 7]!;

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
    const [whiteKeysPressed, setWhiteKeysPressed] = useState(() =>
        Array.from({ length: 35 }, () => false)
        // .map((v, i) => i === 4 && true || v)
    );
    const [blackKeysPressed, setBlackKeysPressed] = useState(() =>
        Array.from({ length: 25 }, () => false)
        // .map((v, i) => i === 5 && true || v)
    );

    const { pitch, init } = usePitchy();

    useEffect(() => {
        setTimeout(() => {
            const key = findNearestKey(pitch);
            // const key = findNearestKey(554);

            if (key === 0) {
                setBlackKeysPressed(
                    Array.from({ length: 25 }, () => false)
                );
                setWhiteKeysPressed(
                    Array.from({ length: 35 }, () => false)
                );
                return;
            };

            if (key.type === "black") {
                console.log(key)
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
        }, 0);
    }, [pitch]);

    return (
        <div className={cn("shadow w-10/12 mt-4 p-2 mx-auto",
            "flex flex-col justify-center items-center"
        )}>
            <h1 className="font-bold text-2xl">pitch echo</h1>
            <div className="border">
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
            </div>
            {pitch === -1 && <div>
                <label>record</label>
                <input type="checkbox" onChange={e => {
                    if (e.target.checked) {
                        init();
                    }
                }} />
            </div>}
            <span>{pitch}</span>
        </div>
    );
}
