/**
 * A thin ring with a gap that turns at a steady pace, in the current text
 * colour: black on the white buttons, white on the dark chips. Matches the
 * site's 1px rings better than MUI's CircularProgress, whose arc grows and
 * shrinks as it spins. Decorative unless given a `label` (the button text
 * usually says "Saving…" already). Slower under reduced motion.
 */
export default function Spinner({ size = 14, label, className = "" }: {
    size?: number;
    label?: string;
    className?: string;
}) {
    return (
        <span
            role={label ? "status" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            style={{ width: size, height: size }}
            className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:[animation-duration:2s] ${className}`}
        />
    );
}
