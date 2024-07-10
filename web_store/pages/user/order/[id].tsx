import {GetServerSideProps} from "next";
import nookies from "nookies";
import axios, {AxiosRequestConfig} from "axios";
import {Order} from "../../../models/Order";
import {Layout} from "../../../components/Layout";
import {Card, CardContent} from "@mui/material";
import Typography from "@mui/material/Typography";
import {SeverityPill} from "../../../components/order/severity-pill";
import Box from "@mui/material/Box";
import CartButton from "../../../components/actions/CartButton";


const API_URL: string = `/${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}`;

interface OrderDetailsProps {
    order: Order
}

function OrderDetails({order}: OrderDetailsProps) {

    function formatDate(date: number) {
        let d = new Date(date);
        return d.toLocaleDateString();
    }

    function formatCurrency(value: number) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        return formatter.format(value/100);
    }

    return (
        <Box className={"flex align-middle justify-center"}>
            <div className={"flex flex-col gap-4 px-2 py-4 w-full md:w-5/6 "}>

                <div className={"flex flex-col gap-1 text-white"}>


                    <div className={"flex flex-row gap-1 justify-between"}>
                        <Typography variant="h5" component="div">
                            Order# {order.id}
                        </Typography>

                        <div className={"flex-grow"}>
                            <SeverityPill
                                color={(order.status === 'SHIPPED' && 'success')
                                    || (order.status === 'REFUNDED' && 'error')
                                    || (order.status === 'PENDING' && 'warning')
                                    || (order.status === 'CANCELLED' && 'error')
                                    || (order.status === 'CREATED' && 'info')
                                    || 'warning'}
                            >
                                {order.status}
                            </SeverityPill>
                        </div>
                    </div>

                    <Typography variant="body1">
                        Ordered on {formatDate(order.created)}
                    </Typography>

                </div>

                <Card>
                    <CardContent>

                        <div className={"flex flex-row gap-1 md:flex flex-col gap-4 justify-between "}>

                            <div className={"flex flex-row "}>
                                <div className={""}>

                                    <Typography variant="h6" component="div" sx={{flexGrow: 1, color: 'inherit'}}>
                                        Shipping Address
                                    </Typography>
                                    <Typography variant="body2" component="div"
                                                sx={{flexGrow: 1, color: 'inherit'}}>
                                        {order.shipping.firstName} {order.shipping.lastName}
                                    </Typography>
                                    <Typography variant="body2" component="div"
                                                sx={{flexGrow: 1, color: 'inherit'}}>
                                        {order.shipping.street}
                                    </Typography>

                                    <Typography variant="body2" component="div"
                                                sx={{flexGrow: 1, color: 'inherit'}}>
                                        {order.shipping.city} {order.shipping.state} {order.shipping.postcode}
                                    </Typography>
                                </div>

                            </div>

                            <div className={"flex flex-row gap-1"}>
                                <div className={""}>

                                    <Typography variant="h6" component="div" sx={{flexGrow: 1, color: 'inherit'}}>
                                        Payment Method
                                    </Typography>
                                    <Typography variant="body2" component="div"
                                                sx={{flexGrow: 1, color: 'inherit'}}>
                                        **** **** ****
                                    </Typography>
                                </div>

                            </div>


                            <div className={"flex flex-row gap-1"}>
                                <div className={""}>
                                    <Typography variant="h6" component="div" sx={{flexGrow: 1, color: 'inherit'}}>
                                        Order Summary
                                    </Typography>

                                    <Typography variant="body2" component="div"
                                                sx={{flexGrow: 1, color: 'inherit'}}>
                                        Subtotal: {formatCurrency(order.subTotal)}
                                    </Typography>
                                    <Typography variant="body2" component="div"
                                                sx={{flexGrow: 1, color: 'inherit'}}>
                                        Shipping: {formatCurrency(5.00)}
                                    </Typography>
                                    <Typography variant="body2" component="div"
                                                sx={{flexGrow: 1, color: 'inherit'}}>
                                        Tax: {formatCurrency(order.tax)}
                                    </Typography>
                                    <Typography variant="body2" component="div"
                                                sx={{flexGrow: 1, color: 'inherit'}}>
                                        Total: {formatCurrency(order.total)}
                                    </Typography>

                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <div className={"flex flex-col gap-1 "}>
                    {order.items.map((item, index) => (
                        <div key={index} className={"flex flex-row gap-1"}>
                            <Card className={"w-full"}>
                                <CardContent className={"flex flex-row gap-2"}>
                                    <div className={"w-24 h-50"}>
                                        <img src={item.photo} className={"object-cover rounded-md"}/>
                                    </div>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            gap: 1,
                                            width: '100%',
                                            p: 1
                                        }}
                                    >
                                        <Typography variant="body1" component="div" sx={{color: 'inherit'}}>
                                            {item.description}
                                        </Typography>
                                        <Typography variant="subtitle2" component="div" sx={{color: 'inherit'}}>
                                            SKU: {item.sku}
                                        </Typography>
                                        <Typography variant="subtitle2" component="div"
                                                    sx={{flexGrow: 1, color: 'inherit'}}>
                                            {item.quantity} x {formatCurrency(item.price)}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </Box>

    )
}

export default OrderDetails;


export const getServerSideProps: GetServerSideProps = async (context) => {

    const id = context.query.id as string;

    try {
        const cookies = nookies.get(context);

        if (!cookies.token) {
            return {
                redirect: {
                    destination: '/',
                },
                props: {} as never,
            }
        }


        const axiosInstance = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL,
        } as AxiosRequestConfig);

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${cookies.token}`;

        let fetcher = (url: string) => axiosInstance.get(url)
            .then((response: { data: any; }) => response.data)
            .catch((error: any) => {
                return null
            })


        const data = await fetcher(`${API_URL}/${id}`);


        if (!data) {
            return {
                notFound: true,
            }
        }

        return {
            props: {
                order: data
            }
        }

    } catch (e) {
        return {
            redirect: {
                destination: '/',
            },
            props: {} as never,
        }
    }

}


OrderDetails.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);