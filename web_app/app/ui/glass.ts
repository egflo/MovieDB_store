/**
 * Frosted-glass surface for cards laid over a page background (the movie
 * page's ScrollZoomBackdrop): a light translucent tint, blur with a little
 * extra saturation so the background's colour shows through, a hairline edge
 * and a faint top highlight. Matches the poster preview and hero caption.
 */
export const GLASS_CARD =
    "bg-white/[0.07] ring-1 ring-inset ring-white/10 backdrop-blur-xl backdrop-saturate-150 " +
    "shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]";
