'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { useAuth } from '@/lib/firebase/AuthContext';
import { useCart } from '@/lib/context/CartContext';

/**
 * Site-wide top bar: wordmark, search, cart and account. Frosted glass to
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
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { count } = useCart();

    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');

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

    // Keep the field in step with the search page's own query, and clear it
    // when leaving search.
    useEffect(() => {
        setQuery(pathname === '/search' ? searchParams.get('query') ?? '' : '');
    }, [pathname, searchParams]);

    // "/" focuses search from anywhere, unless the user is already typing.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
            const target = e.target as HTMLElement;
            if (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
            e.preventDefault();
            inputRef.current?.focus();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        inputRef.current?.blur();
        router.push(`/search?query=${encodeURIComponent(q)}`);
    };

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

                <form role="search" onSubmit={submit} className="ml-auto">
                    <label className="group flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/10 backdrop-blur-md transition-colors focus-within:bg-white/15 focus-within:ring-white/25">
                        <SearchRoundedIcon fontSize="small" className="text-white/60" aria-hidden="true" />
                        <span className="sr-only">Search movies</span>
                        <input
                            ref={inputRef}
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') inputRef.current?.blur();
                                // Submit explicitly rather than rely on the
                                // browser's implicit submission; preventDefault
                                // stops that too, so it never fires twice.
                                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                    e.preventDefault();
                                    e.currentTarget.form?.requestSubmit();
                                }
                            }}
                            placeholder="Search"
                            enterKeyHint="search"
                            className="w-28 bg-transparent text-sm outline-none transition-[width] duration-200 placeholder:text-white/50 focus:w-44 sm:w-40 sm:focus:w-64 [&::-webkit-search-cancel-button]:hidden"
                        />
                    </label>
                </form>

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
        </header>
    );
}
