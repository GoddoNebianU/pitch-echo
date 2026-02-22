import { cn } from "../utils/cn";
import MCanvas from "./MCanvas";
import { useEffect, useRef, useState } from "react";
import { useMicPitch } from "../lib/useMicPitch";
import { aCanvasDraw, mCanvasDraw } from "../utils/canvas";
import ACanvas from "./ACanvas";
import { useAudioFilePitch } from "../lib/useAudioFilePitch";
import Piano from "./Piano";

export default function App() {
    const mCanvasRef = useRef<HTMLCanvasElement>(null);
    const aCanvasRef = useRef<HTMLCanvasElement>(null);
    const [playBeginTime, setPlayBeginTime] = useState<null | number>(null);
    const [mWhiteKeysPressed, setMWhiteKeysPressed] = useState(() =>
        Array.from({ length: 35 }, () => false)
        // .map((v, i) => i === 4 && true || v)
    );
    const [mBlackKeysPressed, setMBlackKeysPressed] = useState(() =>
        Array.from({ length: 25 }, () => false)
        // .map((v, i) => i === 5 && true || v)
    );
    const [running, setRunning] = useState(false);
    const { mPitch, mInit } = useMicPitch();
    const { pitchList, aInit } = useAudioFilePitch("/01.flac");

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
            mCanvasDraw({
                pitch: mPitch,
                canvasRef: mCanvasRef,
                setWhiteKeysPressed: setMWhiteKeysPressed,
                setBlackKeysPressed: setMBlackKeysPressed,
                blockQueue: mBlockQueue,
            });
            aCanvasDraw({
                canvasRef: aCanvasRef,
                blockQueue: aBlockQueue,
                playBeginTime: playBeginTime,
                pitchList: pitchList
            });
        }, 1000 / 60);
        return () => {
            if (timer.current) window.clearInterval(timer.current);
        };
    }, [mPitch, pitchList, playBeginTime]);

    return (
        <div className={cn("shadow-lg w-fit h-[650px] mt-4 p-4 mx-auto",
            "flex flex-col items-center gap-2"
        )}>
            <h1 className="font-bold text-2xl">pitch echo</h1>
            {!running && <div>
                <label>start</label>
                <input type="checkbox" onChange={e => {
                    if (e.target.checked) {
                        mInit();
                        aInit();
                        setRunning(true);

                        const audio = new Audio("/01.flac");
                        // audio.volume = 0.1;
                        audio.play();
                        setPlayBeginTime(Date.now());
                    }
                }} />
            </div>}
            <Piano whiteKeysPressed={mWhiteKeysPressed} blackKeysPressed={mBlackKeysPressed} />
            <div className="relative">
                <ACanvas
                    canvasRef={aCanvasRef} />
                <MCanvas
                    canvasRef={mCanvasRef} />
            </div>
        </div>
    );
}
