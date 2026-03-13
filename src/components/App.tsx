import { cn } from "../utils/cn";
import MyCanvas from "./MyCanvas";
import { useEffect, useRef, useState } from "react";
import { useMicPitch } from "../lib/useMicPitch";
import { aCanvasDraw, mCanvasDraw } from "../utils/canvas";
import { useAudioFilePitch } from "../lib/useAudioFilePitch";
import Piano from "./Piano";
import { BLACK_KEY_COUNT, CANVAS_WIDTH, DEFAULT_SONG_URL, ENABLE_AUDIO, START_Y_M, WHITE_KEY_COUNT } from "../lib/config";
import { useGlobalStore } from "../globalStore";

export default function App() {
    const mCanvasRef = useRef<HTMLCanvasElement>(null);
    const aCanvasRef = useRef<HTMLCanvasElement>(null);

    const {
        dbThreshold,
        setDbThreshold
    } = useGlobalStore();

    const [playBeginTime, setPlayBeginTime] = useState<null | number>(null);
    const [mWhiteKeysPressed, setMWhiteKeysPressed] = useState(() =>
        Array.from({ length: WHITE_KEY_COUNT }, () => false)
        // .map((v, i) => i === 4 && true || v)
    );
    const [mBlackKeysPressed, setMBlackKeysPressed] = useState(() =>
        Array.from({ length: BLACK_KEY_COUNT }, () => false)
        // .map((v, i) => i === 5 && true || v)
    );
    const [running, setRunning] = useState(false);
    const [isFirstInterval, setIsFirstInterval] = useState(true);
    const { pitchResult: mPitch, mInit, mCleanup } = useMicPitch();
    const mPitchRef = useRef(mPitch);
    useEffect(() => {
        mPitchRef.current = mPitch;
    });
    const { pitchList, aInit } = useAudioFilePitch(DEFAULT_SONG_URL);

    const mBlockQueue = useRef<Array<{
        "type": "white" | "black";
        "index": number;
        "y": number;
        "len": number;
    }>>([]);
    const aBlockQueue = useRef<Array<{
        "type": "white" | "black";
        "index": number;
        "y": number;
        "len": number;
    }>>([]);
    const timer = useRef<number | null>(null);
    useEffect(() => {
        // if (mPitch <= 0) return;
        timer.current = window.setInterval(() => {
            if (ENABLE_AUDIO) {
                if (!pitchList.length) return;
                if (isFirstInterval) {
                    const audio = new Audio(DEFAULT_SONG_URL);
                    audio.play();
                    setPlayBeginTime(Date.now());
                    setIsFirstInterval(false);
                }
                aCanvasDraw({
                    canvasRef: aCanvasRef,
                    blockQueue: aBlockQueue,
                    playBeginTime: playBeginTime,
                    pitchList: pitchList
                });
            }
            mCanvasDraw({
                pitch: mPitchRef.current.pitch,
                canvasRef: mCanvasRef,
                setWhiteKeysPressed: setMWhiteKeysPressed,
                setBlackKeysPressed: setMBlackKeysPressed,
                blockQueue: mBlockQueue,
            });
        }, 1000 / 60);
        return () => {
            if (timer.current) window.clearInterval(timer.current);
        };
    }, [isFirstInterval, pitchList, playBeginTime]);

    // 清理麦克风资源
    useEffect(() => {
        return () => {
            mCleanup();
        };
    }, [mCleanup]);

    return (
        <div className={cn("shadow-lg w-fit h-162.5 mt-4 p-4 mx-auto",
            "flex flex-col items-center gap-2"
        )}>
            <h1 className="font-bold text-2xl">pitch echo</h1>
            {!running && <div>
                <label>start</label>
                <input type="checkbox" onChange={e => {
                    if (e.target.checked) {
                        mInit();
                        if (ENABLE_AUDIO) aInit();
                        setRunning(true);
                    }
                }} />
            </div>
            }

            {<div>
                <label>分贝阈值： {dbThreshold}dB</label>
                <input type="range" min={1} max={100}
                    value={-dbThreshold}
                    onChange={(e) => {
                        setDbThreshold(-parseInt(e.target.value));
                    }} />
            </div>}

            <Piano whiteKeysPressed={mWhiteKeysPressed} blackKeysPressed={mBlackKeysPressed} />
            <div className="relative">
                {
                    ENABLE_AUDIO && (<MyCanvas
                        canvasRef={aCanvasRef} transparent={false} />)}

                <MyCanvas
                    canvasRef={mCanvasRef} transparent={true} />
                <div
                    style={{
                        marginTop: START_Y_M + "px",
                        width: CANVAS_WIDTH + "px"
                    }}
                    className="h-1 bg-black/50"></div>
            </div>
        </div>
    );
}
