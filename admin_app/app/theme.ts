'use client';

import { createTheme } from "@mui/material/styles";

/**
 * A plain MUI theme: the admin app is tables and forms, so it keeps MUI's
 * defaults rather than the store's glass look. Follows the system's light or
 * dark setting.
 */
export const theme = createTheme({
    colorSchemes: { light: true, dark: true },
    cssVariables: { colorSchemeSelector: "media" },
    typography: {
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    },
    shape: { borderRadius: 8 },
    components: {
        MuiButton: { defaultProps: { disableElevation: true } },
        MuiCard: { defaultProps: { variant: "outlined" } },
    },
});
