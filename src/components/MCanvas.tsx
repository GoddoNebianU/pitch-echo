interface MCanvasProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function MCanvas(
    { canvasRef }: MCanvasProps
) {
    return (
        <div className="border flex flex-col absolute left-1/2 -translate-x-1/2">
            <canvas
                width={840}
                height={400}
                className="opacity-50"
                ref={canvasRef}>Your browser does not support canvas.</canvas>
        </div>
    );
}
