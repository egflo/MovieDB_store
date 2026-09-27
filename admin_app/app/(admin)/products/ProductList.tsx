"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { formatPrice } from "@/lib/api/client";
import {
    isProductSort, PRODUCT_SORTS, PRODUCTS_PER_PAGE, ProductSort, useInventory, useProductSearch,
} from "@/lib/api/admin/products";
import { Movie } from "@/lib/models/Movie";
import PageHeader from "@/app/ui/PageHeader";
import Poster from "@/app/ui/Poster";
import StockChip from "@/app/ui/StockChip";

const DEFAULT_SORT: ProductSort = "popular";
const COLUMNS = 5;

/** Price and stock come from inventory, one lookup per row. */
function InventoryCells({ movieId }: { movieId: string }) {
    const { data, error, isLoading } = useInventory(movieId);

    if (isLoading) {
        return (
            <>
                <TableCell align="right"><Skeleton width={48} sx={{ ml: "auto" }} /></TableCell>
                <TableCell><Skeleton width={90} /></TableCell>
            </>
        );
    }
    if (error) {
        return <TableCell colSpan={2}><Typography variant="body2" color="error">Couldn’t load</Typography></TableCell>;
    }
    if (!data) {
        return <TableCell colSpan={2}><Typography variant="body2" color="text.secondary">Not for sale</Typography></TableCell>;
    }
    return (
        <>
            <TableCell align="right">{formatPrice(data.price, data.currency?.toUpperCase())}</TableCell>
            <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, whiteSpace: "nowrap" }}>
                    <StockChip status={data.status} />
                    <Typography variant="body2" color="text.secondary">{data.quantity}</Typography>
                </Box>
            </TableCell>
        </>
    );
}

function ProductRow({ movie, onOpen }: { movie: Movie; onOpen: () => void }) {
    // ~11,000 records have no title (WORKPLAN item 37); show them honestly.
    const title = movie.title || "Untitled";
    return (
        <TableRow
            hover
            onClick={onOpen}
            onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}
            tabIndex={0}
            sx={{ cursor: "pointer" }}
            aria-label={`${title}, open product`}
        >
            <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
                    <Poster src={movie.poster} title={title} width={36} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={500} color={movie.title ? "text.primary" : "text.secondary"} noWrap>
                            {title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{movie.movieId}</Typography>
                    </Box>
                </Box>
            </TableCell>
            <TableCell>{movie.year || "—"}</TableCell>
            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                <Typography variant="body2" color="text.secondary" noWrap>
                    {movie.genres?.slice(0, 3).join(", ") || "—"}
                </Typography>
            </TableCell>
            <InventoryCells movieId={movie.id} />
        </TableRow>
    );
}

export default function ProductList() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    const text = params.get("q") ?? "";
    const sortParam = params.get("sort");
    const sort: ProductSort = isProductSort(sortParam) ? sortParam : DEFAULT_SORT;
    const page = Math.max(0, (Number(params.get("page")) || 1) - 1);

    // The box updates at once; the URL (and the search) after a pause.
    const [draft, setDraft] = useState(text);
    useEffect(() => setDraft(text), [text]);

    function update(next: { q?: string; sort?: ProductSort; page?: number }) {
        const merged = new URLSearchParams(params);
        const set = (key: string, value: string | undefined, fallback: string) =>
            value && value !== fallback ? merged.set(key, value) : merged.delete(key);
        if (next.q !== undefined) set("q", next.q.trim(), "");
        if (next.sort !== undefined) set("sort", next.sort, DEFAULT_SORT);
        // Any change other than paging goes back to page 1.
        set("page", next.page !== undefined ? String(next.page + 1) : undefined, "1");
        const qs = merged.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }

    useEffect(() => {
        if (draft.trim() === text.trim()) return;
        const timer = setTimeout(() => update({ q: draft }), 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft]);

    const { data, error, isLoading, isValidating } = useProductSearch({ text, sort, page });

    return (
        <>
            <PageHeader
                title="Products"
                subtitle={data ? `${data.totalElements.toLocaleString()} ${text ? "matching" : "in the catalogue"}` : "The catalogue, with price and stock."}
                action={
                    <Button component={Link} href="/products/new" variant="contained" startIcon={<AddRoundedIcon />}>
                        Add product
                    </Button>
                }
            />

            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <TextField
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Search by title"
                    size="small"
                    sx={{ flex: "1 1 240px" }}
                    slotProps={{
                        input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> },
                        htmlInput: { "aria-label": "Search products by title" },
                    }}
                />
                <TextField
                    select
                    label="Sort"
                    size="small"
                    value={sort}
                    onChange={(e) => update({ sort: e.target.value as ProductSort })}
                    sx={{ minWidth: 200 }}
                >
                    {Object.entries(PRODUCT_SORTS).map(([key, option]) => (
                        <MenuItem key={key} value={key}>{option.label}</MenuItem>
                    ))}
                </TextField>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Couldn’t load the catalogue. Check movie_service is running.
                </Alert>
            )}

            <Card>
                <Box sx={{ height: 4 }}>{isValidating && !isLoading && <LinearProgress />}</Box>
                <TableContainer>
                    <Table size="small" aria-label="Products">
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Year</TableCell>
                                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Genres</TableCell>
                                <TableCell align="right">Price</TableCell>
                                <TableCell>Stock</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading && Array.from({ length: PRODUCTS_PER_PAGE }, (_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={COLUMNS}><Skeleton height={54} /></TableCell>
                                </TableRow>
                            ))}
                            {data?.content.map((movie) => (
                                <ProductRow key={movie.id} movie={movie} onOpen={() => router.push(`/products/${movie.id}`)} />
                            ))}
                            {data && data.content.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={COLUMNS}>
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                            No products match “{text}”.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {data && data.totalElements > 0 && (
                    <TablePagination
                        component="div"
                        count={data.totalElements}
                        page={Math.min(page, Math.max(0, data.totalPages - 1))}
                        onPageChange={(_, next) => update({ page: next })}
                        rowsPerPage={PRODUCTS_PER_PAGE}
                        rowsPerPageOptions={[PRODUCTS_PER_PAGE]}
                    />
                )}
            </Card>
        </>
    );
}
