import type { Metadata } from "next";
import NotBuiltYet from "@/app/ui/NotBuiltYet";

export const metadata: Metadata = { title: "Reviews" };

export default function ReviewsPage() {
    return (
        <NotBuiltYet
            title="Reviews"
            summary="Customer reviews and comments, with moderation."
            needs={[
                { what: "List ratings", endpoint: "GET /user-service/admin/sentiment/all", ready: true },
                { what: "List and delete any review or comment", endpoint: "missing (the user routes are owner-checked)", ready: false },
            ]}
        />
    );
}
