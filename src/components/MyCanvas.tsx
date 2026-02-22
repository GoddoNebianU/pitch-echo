import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../lib/config";
import { cn } from "../utils/cn";

interface MCanvasProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    transparent: boolean;
}

export default function MyCanvas(
    { canvasRef, transparent }: MCanvasProps
) {
    return (
        <div className="border flex flex-col absolute left-1/2 -translate-x-1/2">
            <canvas
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className={cn(transparent && "opacity-50")}
                ref={canvasRef}>Your browser does not support canvas.</canvas>
        </div>
    );
}
