"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { MovieRequest } from "@/lib/api/admin/movies";
import { optimizedImage } from "@/lib/image";
import { Movie } from "@/lib/models/Movie";
import Poster from "@/app/ui/Poster";
import CastEditor from "./CastEditor";
import {
    FormErrors, GENRES, MovieFormState, RATED_SUGGESTIONS, RT_AUDIENCE_STATUSES, RT_CRITIC_STATUSES,
    sameRequest, toRequest, validate,
} from "./movieFormState";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <Card>
            <CardContent>
                <Typography variant="subtitle1" component="h2" fontWeight={600}>{title}</Typography>
                {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
                <Box sx={{ mt: 2 }}>{children}</Box>
            </CardContent>
        </Card>
    );
}

const GRID = { display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" } };

/** Landscape preview for background and logo URLs. */
function WidePreview({ src, contain }: { src: string; contain?: boolean }) {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [src]);
    if (!/^https?:\/\//.test(src) || failed) return null;
    return (
        <Box
            component="img"
            {...optimizedImage(src, 320, 180)}
            alt=""
            onError={() => setFailed(true)}
            sx={{ width: 160, height: 90, objectFit: contain ? "contain" : "cover", borderRadius: 1, bgcolor: "action.hover", mt: 1 }}
        />
    );
}

export default function MovieForm({ mode, initial, base, onSubmit, submitLabel, extra, extraError, onSubmitAttempt }: {
    mode: "create" | "edit";
    initial: MovieFormState;
    /** The movie being edited; its hidden rating fields are kept. */
    base?: Movie | null;
    /** Throw an Error whose message is shown to the admin. */
    onSubmit: (request: MovieRequest) => Promise<void>;
    submitLabel: string;
    /** More fields in the same form (price and stock when adding). */
    extra?: React.ReactNode;
    /** A problem in `extra` that blocks submitting. */
    extraError?: string | null;
    /** Called on every submit, valid or not, so `extra` can show its errors. */
    onSubmitAttempt?: () => void;
}) {
    const [state, setState] = useState(initial);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState("");

    // A save (or a reload) gives a new starting point.
    useEffect(() => {
        setState(initial);
        setErrors({});
        setSubmitted(false);
    }, [initial]);

    const dirty = useMemo(() => mode === "create" || !sameRequest(state, initial), [mode, state, initial]);

    // Re-check as the admin fixes things, once they've tried to submit.
    useEffect(() => {
        if (submitted) setErrors(validate(state, mode));
    }, [state, submitted, mode]);

    useEffect(() => {
        if (!dirty || mode === "create") return;
        const warn = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [dirty, mode]);

    function set<K extends keyof MovieFormState>(key: K, value: MovieFormState[K]) {
        setState((s) => ({ ...s, [key]: value }));
    }

    /** A text field bound to one form key, with its error. */
    function field(key: keyof MovieFormState, props: TextFieldProps = {}) {
        return (
            <TextField
                size="small"
                fullWidth
                value={state[key] as string}
                onChange={(e) => set(key, e.target.value as never)}
                {...props}
                // After the spread, so an error replaces the field's own hint.
                error={!!errors[key]}
                helperText={errors[key] ?? props.helperText}
            />
        );
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setSubmitted(true);
        onSubmitAttempt?.();
        const found = validate(state, mode);
        setErrors(found);
        if (Object.keys(found).length > 0 || extraError) {
            setServerError("Fix the highlighted fields first.");
            return;
        }
        setSaving(true);
        setServerError("");
        try {
            await onSubmit(toRequest(state, base));
        } catch (e) {
            setServerError((e as Error).message || "Couldn’t save. Try again.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
                <Section title="Details">
                    <Box sx={{ display: "flex", gap: 3, flexWrap: { xs: "wrap", md: "nowrap" }, alignItems: "flex-start" }}>
                        {/* Keyed by URL so a new link gets a fresh load (Poster remembers failures). */}
                        <Poster key={state.poster} src={state.poster} title={state.title || "New movie"} width={120} />
                        <Box sx={{ ...GRID, flex: 1 }}>
                            {mode === "create"
                                ? field("movieId", { label: "IMDb id", required: true, placeholder: "tt0468569", helperText: "Can’t be changed later" })
                                : field("movieId", { label: "IMDb id", disabled: true, helperText: "Fixed: inventory and suggestions use it" })}
                            {field("title", { label: "Title", required: true })}
                            {field("year", { label: "Year", required: true, slotProps: { htmlInput: { inputMode: "numeric" } } })}
                            <Autocomplete
                                freeSolo
                                options={RATED_SUGGESTIONS}
                                inputValue={state.rated}
                                onInputChange={(_, value) => set("rated", value)}
                                renderInput={(params) => <TextField {...params} size="small" label="Rated" />}
                            />
                            {field("runtime", { label: "Runtime", placeholder: "2 h 32 min" })}
                            {field("language", { label: "Language" })}
                            {field("country", { label: "Country" })}
                            {field("director", { label: "Director" })}
                            {field("production", { label: "Production" })}
                        </Box>
                    </Box>
                    <Box sx={{ mt: 2, display: "grid", gap: 2 }}>
                        {field("writer", { label: "Writer" })}
                        {field("plot", { label: "Plot", multiline: true, minRows: 3 })}
                        {field("awards", { label: "Awards" })}
                    </Box>
                </Section>

                <Section title="Genres">
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" role="group" aria-label="Genres">
                        {GENRES.map((genre) => {
                            const on = state.genres.includes(genre);
                            return (
                                <Chip
                                    key={genre}
                                    label={genre}
                                    color={on ? "primary" : "default"}
                                    variant={on ? "filled" : "outlined"}
                                    onClick={() => set("genres", on ? state.genres.filter((g) => g !== genre) : [...state.genres, genre])}
                                    aria-pressed={on}
                                />
                            );
                        })}
                    </Stack>
                </Section>

                <Section title="Cast and crew" subtitle="In the order the store lists them.">
                    <CastEditor rows={state.cast} onChange={(cast) => set("cast", cast)} errors={errors} />
                </Section>

                <Section title="Images" subtitle="Links to the image files (fanart.tv or IMDb).">
                    <Box sx={{ display: "grid", gap: 2 }}>
                        {field("poster", { label: "Poster URL" })}
                        <Box>
                            {field("background", { label: "Background URL" })}
                            <WidePreview src={state.background} />
                        </Box>
                        <Box>
                            {field("logo", { label: "Logo URL" })}
                            <WidePreview src={state.logo} contain />
                        </Box>
                    </Box>
                </Section>

                <Section title="Scores and box office" subtitle="Leave a box empty if there’s no score.">
                    <Box sx={GRID}>
                        {field("rating", { label: "IMDb rating", placeholder: "0–10", slotProps: { htmlInput: { inputMode: "decimal" } } })}
                        {field("numOfVotes", { label: "IMDb votes", slotProps: { htmlInput: { inputMode: "numeric" } } })}
                        {field("metacritic", { label: "Metacritic", placeholder: "0–100", slotProps: { htmlInput: { inputMode: "numeric" } } })}
                        {field("rottenTomatoes", { label: "Rotten Tomatoes critics", placeholder: "0–100", slotProps: { input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }, htmlInput: { inputMode: "numeric" } } })}
                        {field("rottenTomatoesStatus", {
                            label: "Critics status",
                            select: true,
                            children: [<MenuItem key="" value=""><em>None</em></MenuItem>, ...RT_CRITIC_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)],
                        })}
                        {field("rottenTomatoesAudience", { label: "Rotten Tomatoes audience", placeholder: "0–100", slotProps: { input: { endAdornment: <InputAdornment position="end">%</InputAdornment> }, htmlInput: { inputMode: "numeric" } } })}
                        {field("rottenTomatoesAudienceStatus", {
                            label: "Audience status",
                            select: true,
                            children: [<MenuItem key="" value=""><em>None</em></MenuItem>, ...RT_AUDIENCE_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)],
                        })}
                        {field("boxOffice", { label: "Box office (as shown)", placeholder: "$534,858,444" })}
                        {field("revenue", {
                            label: "Worldwide gross",
                            helperText: "Whole dollars; the store’s Box office sort uses it",
                            slotProps: { input: { startAdornment: <InputAdornment position="start">$</InputAdornment> }, htmlInput: { inputMode: "numeric" } },
                        })}
                    </Box>
                </Section>

                {extra}

                <Paper
                    elevation={3}
                    sx={{
                        position: "sticky", bottom: 16, zIndex: 2, p: 1.5, pl: 2,
                        display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap",
                    }}
                >
                    <Typography variant="body2" color={serverError ? "error" : "text.secondary"} sx={{ flex: 1, minWidth: 200 }} role="status">
                        {serverError || (mode === "edit" ? (dirty ? "Unsaved changes" : "No changes") : "")}
                    </Typography>
                    {mode === "edit" && (
                        <Button onClick={() => { setState(initial); setServerError(""); setSubmitted(false); setErrors({}); }} disabled={!dirty || saving}>
                            Discard
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!dirty || saving}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {saving ? "Saving" : submitLabel}
                    </Button>
                </Paper>
            </Stack>
        </Box>
    );
}
