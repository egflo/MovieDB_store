import React from "react";
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import {CHIP, CHIP_ICON_SIZE} from "@/app/ui/chip";

/** Previous / "Page n of m" / Next, as chips. Renders nothing for one page. `page` is 1-based. */
export default function Pager({page, totalPages, onPage}: { page: number; totalPages: number; onPage: (n: number) => void }) {
    if (totalPages <= 1) return null;
    return (
        <nav aria-label="Pages" className="flex items-center justify-center gap-3 pt-2">
            <button type="button" className={`${CHIP} cursor-pointer pl-2 pr-3.5`} disabled={page <= 1} onClick={() => onPage(page - 1)}>
                <ChevronLeftRoundedIcon sx={CHIP_ICON_SIZE} /> Previous
            </button>
            <span className="text-sm text-white/70" aria-current="page">
                Page {page.toLocaleString()} of {totalPages.toLocaleString()}
            </span>
            <button type="button" className={`${CHIP} cursor-pointer pl-3.5 pr-2`} disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
                Next <ChevronRightRoundedIcon sx={CHIP_ICON_SIZE} />
            </button>
        </nav>
    );
}
