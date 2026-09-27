"use client";

import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { formatPrice } from "@/lib/api/client";
import { useAdminOrders } from "@/lib/api/admin/orders";
import { Order } from "@/lib/models/Order";
import PageHeader from "@/app/ui/PageHeader";

const LATEST = 8;

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

function customerName(order: Order): string {
    const { firstName, lastName } = order.shipping ?? {};
    return [firstName, lastName].filter(Boolean).join(" ") || "—";
}

function itemCount(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

function StatCard({ label, value, loading }: { label: string; value: React.ReactNode; loading: boolean }) {
    return (
        <Card>
            <CardContent>
                <Typography variant="overline" color="text.secondary">{label}</Typography>
                <Typography variant="h4" component="p" fontWeight={600}>
                    {loading ? <Skeleton width={80} /> : value}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
    // Newest first: the endpoint sorts by id, descending, by default.
    const { data, error, isLoading } = useAdminOrders({ limit: LATEST });

    return (
        <>
            <PageHeader title="Dashboard" subtitle="The store at a glance." />

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Couldn’t load orders from the gateway. Check the services are running
                    (<code>curl -s localhost:8760/</code>).
                </Alert>
            )}

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, mb: 3 }}>
                <StatCard label="Orders" value={data?.totalElements ?? "—"} loading={isLoading} />
                <StatCard label="Latest order" value={data?.content[0] ? `#${data.content[0].id}` : "—"} loading={isLoading} />
                <Card>
                    <CardContent>
                        <Typography variant="overline" color="text.secondary">Sales and customers</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sales totals, profit and customer counts need an admin stats
                            endpoint, which the backend doesn’t have yet.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            <Card>
                <CardHeader
                    title="Latest orders"
                    titleTypographyProps={{ variant: "subtitle1", fontWeight: 600, component: "h2" }}
                    action={<Button component={Link} href="/orders" size="small">All orders</Button>}
                />
                <TableContainer>
                    <Table size="small" aria-label="Latest orders">
                        <TableHead>
                            <TableRow>
                                <TableCell>Order</TableCell>
                                <TableCell>Placed</TableCell>
                                <TableCell>Ship to</TableCell>
                                <TableCell align="right">Items</TableCell>
                                <TableCell align="right">Total</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading && Array.from({ length: 4 }, (_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 6 }, (_, j) => (
                                        <TableCell key={j}><Skeleton /></TableCell>
                                    ))}
                                </TableRow>
                            ))}
                            {data?.content.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell>#{order.id}</TableCell>
                                    <TableCell sx={{ whiteSpace: "nowrap" }}>{dateFormat.format(new Date(order.created))}</TableCell>
                                    <TableCell>{customerName(order)}</TableCell>
                                    <TableCell align="right">{itemCount(order)}</TableCell>
                                    <TableCell align="right">{formatPrice(order.total, order.currency?.toUpperCase())}</TableCell>
                                    <TableCell>
                                        {/* CREATED is the only status in use until the Stripe webhook (item 14). */}
                                        <Chip size="small" variant="outlined" label={order.status === "CREATED" ? "Placed" : order.status} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {data && data.content.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Typography variant="body2" color="text.secondary">No orders yet.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </>
    );
}
