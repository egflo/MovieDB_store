"use client";

import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import { PersonSuggestion, searchPeople } from "@/lib/api/admin/movies";
import { optimizedImage } from "@/lib/image";
import { CAST_CATEGORIES, CastRow, castKey, FormErrors } from "./movieFormState";

/** On phones the grid is avatar + one column: every field goes in the second. */
const FIELD_SX = { gridColumn: { xs: "2", md: "auto" } };

function label(category: string): string {
    return category.replace(/_/g, " ");
}

/** Search people already credited in the store's films (GET /cast/autocomplete). */
function PersonSearch({ onPick }: { onPick: (person: PersonSuggestion) => void }) {
    const [input, setInput] = useState("");
    const [options, setOptions] = useState<PersonSuggestion[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const text = input.trim();
        // The endpoint answers [] below two letters.
        if (text.length < 2) {
            setOptions([]);
            return;
        }
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                setOptions(await searchPeople(text, controller.signal));
            } catch (e) {
                if (!controller.signal.aborted) console.warn("People search failed", e);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 200);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [input]);

    return (
        <Autocomplete
            options={options}
            loading={loading}
            filterOptions={(x) => x}
            getOptionLabel={(p) => p.name}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            inputValue={input}
            onInputChange={(_, value, reason) => { if (reason !== "reset") setInput(value); }}
            value={null}
            onChange={(_, person) => {
                if (person) {
                    onPick(person);
                    setInput("");
                    setOptions([]);
                }
            }}
            noOptionsText={input.trim().length < 2 ? "Type at least two letters" : "No one by that name in the store"}
            renderOption={({ key, ...props }, p) => (
                <Box component="li" key={key} {...props} sx={{ display: "flex", gap: 1.5 }}>
                    <Avatar src={p.photo ? optimizedImage(p.photo, 40, 40).src : undefined} alt="" sx={{ width: 32, height: 32 }} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2">{p.name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap component="p">
                            {[p.roles.map(label).join(", "), p.knownFor && `known for ${p.knownFor}`].filter(Boolean).join(" · ")}
                        </Typography>
                    </Box>
                </Box>
            )}
            renderInput={(params) => (
                <TextField {...params} size="small" label="Add a person" placeholder="Search by name" />
            )}
            sx={{ flex: "1 1 280px" }}
        />
    );
}

export default function CastEditor({ rows, onChange, errors }: {
    rows: CastRow[];
    onChange: (rows: CastRow[]) => void;
    errors: FormErrors;
}) {
    function update(index: number, changes: Partial<CastRow>) {
        onChange(rows.map((row, i) => (i === index ? { ...row, ...changes } : row)));
    }

    function move(index: number, by: number) {
        const next = [...rows];
        const [row] = next.splice(index, 1);
        next.splice(index + by, 0, row);
        onChange(next);
    }

    function add(row: Omit<CastRow, "key">) {
        onChange([...rows, { key: castKey(), ...row }]);
    }

    return (
        <Stack spacing={1.5}>
            {rows.length === 0 && (
                <Typography variant="body2" color="text.secondary">No cast yet.</Typography>
            )}

            {rows.map((row, i) => {
                const error = errors[`cast.${i}`];
                // Keep an odd stored value ("Actor", null) selectable rather than blanking it.
                const categories = row.category && !CAST_CATEGORIES.includes(row.category)
                    ? [row.category, ...CAST_CATEGORIES]
                    : CAST_CATEGORIES;
                return (
                    <Box
                        key={row.key}
                        sx={{
                            display: "grid", gap: 1, alignItems: "start",
                            gridTemplateColumns: { xs: "40px 1fr", md: "40px minmax(160px, 1.2fr) 150px 170px minmax(160px, 1.5fr) auto" },
                            p: 1, borderRadius: 1, border: 1, borderColor: error ? "error.main" : "divider",
                        }}
                    >
                        <Avatar src={row.photo ? optimizedImage(row.photo, 40, 40).src : undefined} alt="" sx={{ width: 40, height: 40 }} />
                        <TextField
                            size="small"
                            label="Name"
                            sx={FIELD_SX}
                            value={row.name}
                            onChange={(e) => update(i, { name: e.target.value })}
                            error={!!error && !row.name.trim()}
                        />
                        <TextField
                            size="small"
                            label="IMDb id"
                            sx={FIELD_SX}
                            value={row.id}
                            onChange={(e) => update(i, { id: e.target.value })}
                            error={!!error && !!row.name.trim()}
                            helperText={error}
                            placeholder="nm0000123"
                        />
                        <TextField
                            select
                            size="small"
                            label="Role"
                            sx={FIELD_SX}
                            value={row.category}
                            onChange={(e) => update(i, { category: e.target.value })}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {categories.map((c) => <MenuItem key={c} value={c}>{label(c)}</MenuItem>)}
                        </TextField>
                        <TextField
                            size="small"
                            label="Characters"
                            sx={FIELD_SX}
                            value={row.characters}
                            onChange={(e) => update(i, { characters: e.target.value })}
                            placeholder="Comma-separated"
                            disabled={!["actor", "actress", "self", "Actor"].includes(row.category)}
                        />
                        <Box sx={{ display: "flex", gridColumn: { xs: "2", md: "auto" } }}>
                            <Tooltip title="Move up">
                                <span>
                                    <IconButton size="small" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${row.name || "person"} up`}>
                                        <ArrowUpwardRoundedIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Move down">
                                <span>
                                    <IconButton size="small" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label={`Move ${row.name || "person"} down`}>
                                        <ArrowDownwardRoundedIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Remove">
                                <IconButton size="small" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label={`Remove ${row.name || "person"}`}>
                                    <CloseRoundedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                );
            })}

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                <PersonSearch
                    onPick={(p) => add({
                        id: p.id,
                        name: p.name,
                        photo: p.photo ?? "",
                        category: p.roles[0] ?? "actor",
                        characters: "",
                    })}
                />
                <Button
                    startIcon={<PersonAddAlt1RoundedIcon />}
                    onClick={() => add({ id: "", name: "", photo: "", category: "actor", characters: "" })}
                >
                    Someone new
                </Button>
            </Box>
        </Stack>
    );
}
