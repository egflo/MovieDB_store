/**
 * Frosted fade at the edge of a horizontally scrolling row, shown while there
 * is more to scroll that way. The blur is masked from nothing to full strength
 * toward the edge, so items slide under frosted glass rather than into a black
 * gradient. It never takes clicks; the row's arrow buttons sit above it.
 */
export default function ScrollEdge({side, visible}: { side: 'left' | 'right'; visible: boolean }) {
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 w-16 backdrop-blur-md transition-opacity duration-300 ${
                side === 'right'
                    ? 'right-0 [mask-image:linear-gradient(to_left,black,transparent)]'
                    : 'left-0 [mask-image:linear-gradient(to_right,black,transparent)]'
            } ${visible ? 'opacity-100' : 'opacity-0'}`}
        />
    );
}
