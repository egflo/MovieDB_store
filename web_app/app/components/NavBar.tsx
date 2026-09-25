'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { useAuth } from '@/lib/firebase/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import SearchPalette from './SearchPalette';

/**
 * Site-wide top bar: wordmark, search, cart and account. Search is a button
 * that opens SearchPalette (suggestions as you type); "/" or Cmd/Ctrl+K open
 * it from anywhere. Frosted glass to
 * match the poster preview and hero caption; sticky, so content scrolls
 * under it and shows through the blur.
 *
 * On CLEAR_AT_TOP pages the bar starts transparent, with only the search
 * pill and icon buttons visible, and fades into the glass once the page
 * scrolls. Those pages put imagery at the very top, behind the bar.
 */
const CLEAR_AT_TOP: RegExp[] = [
    /^\/$/,          // home: the hero starts under the bar (HomePage's -mt-14)
    /^\/movie\//,    // movie: its backdrop is fixed behind the whole page
];
const SCROLLED_PX = 8;
/** Icon buttons get their own frosted circle while the bar is transparent. */
const ICON_CLEAR = 'bg-black/25 backdrop-blur-md';

export default function NavBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { count } = useCart();

    const [searchOpen, setSearchOpen] = useState(false);
    const searchButton = useRef<HTMLButtonElement>(null);
    const closeSearch = useCallback(() => setSearchOpen(false), []);
    // On the search page the button shows, and the box starts with, its query.
    const currentQuery = pathname === '/search' ? searchParams.get('query') ?? '' : '';

    const clearAtTop = CLEAR_AT_TOP.some((route) => route.test(pathname));
    const [scrolled, setScrolled] = useState(false);
    const clear = clearAtTop && !scrolled;

    // Only the crossing of the threshold changes state, so this re-renders
    // twice per trip down and back up, not on every scroll event.
    useEffect(() => {
        if (!clearAtTop) return;
        const onScroll = () => setScrolled(window.scrollY > SCROLLED_PX);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [clearAtTop, pathname]);

    // Leaving the page (a suggestion, "See all", Back) closes the box.
    useEffect(() => setSearchOpen(false), [pathname, searchParams]);

    // Cmd/Ctrl+K opens search from anywhere; "/" too, unless the user is typing.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const commandK = e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey) && !e.altKey;
            const slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey;
            if (!commandK && !slash) return;
            const target = e.target as HTMLElement;
            if (slash && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
            e.preventDefault();
            setSearchOpen(true);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    return (
        <header
            // The divider is an inset shadow, not a border, so the bar is exactly
            // h-14 and HomePage's -mt-14 lines the hero up with the top edge.
            className={`sticky top-0 z-40 text-white transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
                clear
                    ? 'bg-transparent shadow-none backdrop-blur-[0px]'
                    : 'bg-neutral-950/60 shadow-[inset_0_-1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl backdrop-saturate-150'
            }`}
        >
            <nav className="mx-auto flex h-14 items-center gap-4 px-4 sm:px-6" aria-label="Main">
                <Link href="/" className="text-lg font-semibold tracking-tight">
                    MovieDB
                </Link>

                <button
                    ref={searchButton}
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    aria-haspopup="dialog"
                    aria-label={currentQuery ? `Search movies and people, current search: ${currentQuery}` : 'Search movies and people'}
                    // A round icon button like cart and account on phones; a
                    // search-field-shaped pill with its shortcut from sm up.
                    className={`ml-auto flex cursor-pointer items-center gap-2 rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:bg-white/10 sm:px-3 sm:py-1.5 sm:text-white/60 sm:ring-1 sm:ring-white/10 sm:backdrop-blur-md sm:hover:bg-white/15 ${clear ? ICON_CLEAR : ''}`}
                >
                    <SearchRoundedIcon fontSize="small" aria-hidden="true" className="sm:text-white/60" />
                    <span className="hidden w-32 truncate text-left text-sm sm:block">{currentQuery || 'Search'}</span>
                    <kbd className="hidden rounded px-1.5 font-sans text-[11px] leading-5 text-white/45 ring-1 ring-inset ring-white/15 sm:block">/</kbd>
                </button>

                <Link
                    href="/cart"
                    aria-label={count > 0 ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Cart'}
                    className={`relative rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white ${clear ? ICON_CLEAR : ''}`}
                >
                    <ShoppingBagOutlinedIcon fontSize="small" />
                    {count > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold leading-none">
                            {count > 99 ? '99+' : count}
                        </span>
                    )}
                </Link>

                <Link
                    href={user ? '/user/info' : '/login'}
                    aria-label={user ? 'Account' : 'Sign in'}
                    className={`rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white ${clear ? ICON_CLEAR : ''}`}
                >
                    <PersonOutlineRoundedIcon fontSize="small" />
                </Link>
            </nav>
            {searchOpen && <SearchPalette initialText={currentQuery} onClose={closeSearch} returnFocusTo={searchButton} />}
        </header>
    );
}
