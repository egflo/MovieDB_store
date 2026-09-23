/**
 * One chip look for the movie page's genre chips and the action buttons beside
 * them, so the two rows always match: 36px tall, 14px semibold white text,
 * rgba(0,0,0,0.6) fill, rgba(100,100,100,0.4) on hover, and a faint light
 * outline. Without the outline the dark pill vanishes against the dark
 * backdrop, and its label (inset by the padding) makes the row look indented
 * relative to the plain text rows around it.
 */
const OUTLINE = 'inset 0 0 0 1px rgba(255,255,255,0.15)';
const FILL = 'rgba(0,0,0,0.6)';
const HOVER = 'rgba(100,100,100,0.4)';
const HEIGHT = 36;

/** Tailwind classes for a chip-styled <button>; add px-3.5 for a text chip. */
export const CHIP =
    'inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-black/60 text-sm font-semibold ' +
    'text-white ring-1 ring-inset ring-white/15 transition-colors hover:bg-[rgba(100,100,100,0.4)] ' +
    'disabled:cursor-default disabled:opacity-50';

/** sx for an MUI Chip (the genre chips). */
export const CHIP_SX = {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    color: 'white',
    backgroundColor: FILL,
    boxShadow: OUTLINE,
    cursor: 'pointer',
    '& .MuiChip-label': { fontSize: 14, fontWeight: 600, paddingInline: '14px' },
    '&:hover': { backgroundColor: HOVER },
} as const;

/** sx for an MUI IconButton drawn as a round chip. */
export const CHIP_ICON_SX = {
    width: HEIGHT,
    height: HEIGHT,
    padding: 0,
    color: 'white',
    backgroundColor: FILL,
    boxShadow: OUTLINE,
    transition: 'background-color 150ms',
    '&:hover': { backgroundColor: HOVER },
    '&.Mui-disabled': { color: 'rgba(255,255,255,0.5)', backgroundColor: FILL },
} as const;

/** Icon size inside a chip. */
export const CHIP_ICON_SIZE = { fontSize: 20 } as const;
