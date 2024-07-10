
import {useRouter} from 'next/router';
import {Layout} from "../../components/Layout";
import withAuth from "../../components/withAuth";
import Payments from "../../components/user/Payments";


export default function PaymentPage() {
    const router = useRouter();
    const ProtectedPayment = withAuth(Payments);

    return (
        <ProtectedPayment/>

    )
}


PaymentPage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);