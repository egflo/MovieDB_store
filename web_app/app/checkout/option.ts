/**
 * A choice tile for checkout's radio groups (address, card): a <label>
 * wrapping a visible radio. The whole tile is the hit area; the checked tile
 * brightens and gets a lighter edge, and keyboard focus rings the tile.
 */
export const OPTION =
    "flex cursor-pointer items-start gap-3 rounded-xl bg-white/[0.04] p-4 ring-1 ring-inset ring-white/10 " +
    "transition-colors hover:bg-white/[0.08] has-[:checked]:bg-white/[0.12] has-[:checked]:ring-white/45 " +
    "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-white/70 " +
    "has-[:disabled]:cursor-default has-[:disabled]:opacity-50 has-[:disabled]:hover:bg-white/[0.04]";

/** The radio itself: a hairline ring that fills to a thick white edge when checked. */
export const RADIO =
    "mt-0.5 size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border border-white/40 transition-[border] " +
    "checked:border-[5px] checked:border-white focus-visible:outline-none disabled:cursor-default";

/** The "Default" pill, as on the Addresses and Payment methods pages. */
export const DEFAULT_PILL =
    "shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/85 ring-1 ring-inset ring-white/15";
