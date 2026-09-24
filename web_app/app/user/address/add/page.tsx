import AddAddress from "./AddAddress";

export const metadata = {
    title: "Add address",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
    // Only this one value, so the link can't send people anywhere else.
    const { from } = await searchParams;
    return <AddAddress fromCheckout={from === "checkout"} />;
}
