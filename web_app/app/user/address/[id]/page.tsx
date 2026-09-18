import EditAddress from "./EditAddress";

export const metadata = {
    title: "Edit address",
};

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <EditAddress id={id} />;
}
