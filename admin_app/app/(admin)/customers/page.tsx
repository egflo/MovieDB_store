import type { Metadata } from "next";
import NotBuiltYet from "@/app/ui/NotBuiltYet";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
    return (
        <NotBuiltYet
            title="Customers"
            summary="Store accounts: a searchable list, and each customer's addresses, orders and reviews."
            needs={[
                { what: "List users", endpoint: "GET /user-service/admin/user (no paging yet)", ready: true },
                { what: "Add or delete a user", endpoint: "POST /user-service/admin/user/create, DELETE /user-service/admin/user/{id}", ready: true },
                { what: "One user's details, addresses, orders and reviews", endpoint: "missing", ready: false },
                { what: "Send a password reset", endpoint: "missing (Firebase Admin SDK can generate the link)", ready: false },
            ]}
        />
    );
}
