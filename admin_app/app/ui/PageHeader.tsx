import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function PageHeader({ title, subtitle, action }: {
    title: string;
    subtitle?: React.ReactNode;
    /** e.g. an "Add product" button, right-aligned. */
    action?: React.ReactNode;
}) {
    return (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="h5" component="h1" fontWeight={600}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {action}
        </Box>
    );
}
