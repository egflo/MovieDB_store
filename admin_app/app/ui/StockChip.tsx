import Chip from "@mui/material/Chip";
import { StockStatus } from "@/lib/models/InventoryProduct";

const LABELS: Record<StockStatus, { label: string; color: "success" | "warning" | "error" }> = {
    IN_STOCK: { label: "In stock", color: "success" },
    LIMITED: { label: "Limited", color: "warning" },
    OUT_OF_STOCK: { label: "Out of stock", color: "error" },
};

export default function StockChip({ status }: { status: StockStatus }) {
    const { label, color } = LABELS[status] ?? { label: status, color: "warning" };
    return <Chip size="small" variant="outlined" color={color} label={label} />;
}
