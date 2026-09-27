import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PageHeader from "./PageHeader";

export interface BackendNeed {
    /** What the screen does with it, e.g. "Edit price and stock". */
    what: string;
    /** The gateway path, or what's missing. */
    endpoint: string;
    ready: boolean;
}

/**
 * Placeholder for a screen that isn't built yet, saying what it will do and
 * which backend endpoints it needs (WORKPLAN item 42), so the gaps stay
 * visible in the app itself.
 */
export default function NotBuiltYet({ title, summary, needs }: {
    title: string;
    summary: string;
    needs: BackendNeed[];
}) {
    return (
        <>
            <PageHeader title={title} subtitle={summary} />
            <Card>
                <CardContent>
                    <Typography variant="subtitle1" component="h2" fontWeight={600}>
                        Not built yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        What this screen needs from the backend:
                    </Typography>
                    <List dense>
                        {needs.map((need) => (
                            <ListItem key={need.what} disableGutters>
                                <ListItemText
                                    primary={
                                        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                                            <span>{need.what}</span>
                                            <Chip
                                                size="small"
                                                label={need.ready ? "Endpoint exists" : "Missing"}
                                                color={need.ready ? "success" : "warning"}
                                                variant="outlined"
                                            />
                                        </Stack>
                                    }
                                    secondary={<code>{need.endpoint}</code>}
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </>
    );
}
