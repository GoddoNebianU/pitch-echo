import { cn } from "../utils/cn";
import { getBlackKeyIndex } from "../utils/canvas";

interface PianoProps {
    whiteKeysPressed: boolean[];
    blackKeysPressed: boolean[];
}

export default function Piano({
    whiteKeysPressed, blackKeysPressed
}: PianoProps) {
    return (
        < div className="h-32 flex" >
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
        </div >
    );
}
