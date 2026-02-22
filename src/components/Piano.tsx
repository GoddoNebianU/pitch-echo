import { cn } from "../utils/cn";
import { getBlackKeyIndex } from "../utils/canvas";
import { BLACK_KEY_WIDTH, WHITE_KEY_WIDTH } from "../lib/config";

interface PianoProps {
    whiteKeysPressed: boolean[];
    blackKeysPressed: boolean[];
}

export default function Piano({
    whiteKeysPressed, blackKeysPressed
}: PianoProps) {
    return (
        <div className="h-32 flex flex-row" >
            {
                whiteKeysPressed.map((v: boolean, i) => {
                    return <div
                        style={{
                            width: WHITE_KEY_WIDTH + "px"
                        }}
                        className={cn(
                            "h-full box-border border relative",
                            { "bg-gray-400": v }
                        )}
                        key={"white_key_" + i}>
                        <span className="bottom-0 absolute">
                            {i % 7 === 0 && `C${Math.floor(i / 7) + 2}`}
                        </span>
                        {i % 7 !== 2 && i % 7 !== 6 &&
                            <div key={`black_key_${getBlackKeyIndex(i)}`}
                                style={{
                                    width: BLACK_KEY_WIDTH + "px",
                                    left: WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2 + "px"
                                }}
                                className={cn(
                                    "z-10 bg-black box-border border absolute h-8/12 top-0",
                                    { "bg-gray-400": blackKeysPressed[getBlackKeyIndex(i)] })}>
                            </div>
                        }
                    </div>;
                })
            }
        </div >
    );
}
