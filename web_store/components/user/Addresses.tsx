import { useState, useEffect, Key} from 'react';
import useSWR, {mutate} from 'swr';
import {
    Card,
    CardContent,
    CircularProgress,
    Typography
} from '@mui/material';
import {useRouter} from 'next/router';
import Box from "@mui/material/Box";
import CardActions from "@mui/material/CardActions";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import {auth} from "../../utils/firebase";
import {axiosInstance, fetchAddresses, fetchCart} from "../../api/fetcher";
import {Address} from "../../models/Address";
import {Add} from "@mui/icons-material";


const ADDRESS_URL = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/users/address`;


export default function Addresses() {
    const router = useRouter();
    const {data, error, mutate} = useSWR('addresses', fetchAddresses);

    function  onDefault(id: string) {
        // Set the default address with a PUT request capture errors insert token
        auth.currentUser?.getIdToken(true).then((token) => {
            axiosInstance.post(`${ADDRESS_URL}/${id}/default`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(() => {
                    mutate(); // Refresh the data
                })
                .catch((error) => {
                    console.error('Failed to set default address', error);
                });
        });
    }

    function onDelete(id: string) {
        // Delete the address with a DELETE request capture errors insert token

        auth.currentUser?.getIdToken(true).then((token) => {
            axiosInstance.delete(`${ADDRESS_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(() => {
                    mutate(); // Refresh the data
                })
                .catch((error) => {
                    console.error('Failed to delete address', error);
                });
        });
    }

    function onUpdate(id: string) {
        router.push(`/user/address/${id}`);
    }

    if (error) {
        return <Typography>Error fetching addresses: {error.message}</Typography>;
    }

    if (!data) {
        return <CircularProgress/>; // Show a loading spinner while data is loading
    }

    return (
        <Box className="container-fluid">

            <Box className={"flex justify-end m-auto"}>
                <IconButton onClick={() => router.push('/user/address/add')}>
                    <Add color={"primary"} fontSize={"large"}/>
                </IconButton>
            </Box>


            <Box className="flex gap-2 flex-col md:flex-row flex-wrap justify-center">

                {data.map((address: Address, index: Key | null | undefined) => (
                    <Box key={index}>

                        <Card className={"w-full md:w-96"}>

                            <div className={`${address.isDefault ? "bg-blue-700" : ""}`}>
                                <Divider className={"h-2"}/>
                            </div>

                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {address.firstName} {address.lastName}
                                </Typography>

                                <Box className="d-flex gap-1 flex-col">
                                    <Typography variant="body1" color="text.secondary">
                                        {address.street}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {address.city}, {address.state} {address.postalCode}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {address.country}
                                    </Typography>
                                </Box>
                            </CardContent>
                            <CardActions>

                                <Box
                                    className="d-flex gap-2 w-full justify-content-between"
                                    // Hide on small screens, show on medium and larger
                                >
                                    {!address.isDefault && (
                                        <Button
                                            onClick={() => onDefault(address.id!)}>Set Default</Button>
                                    )}

                                    <Box className="d-flex gap-2">
                                        <Button
                                            onClick={() => onUpdate(address.id!)}>Edit</Button>

                                        <Button  color="error"
                                                 onClick={() => onDelete(address.id!)}>Delete</Button>
                                    </Box>
                                </Box>

                            </CardActions>

                        </Card>
                    </Box>
                ))}
            </Box>

        </Box>
    );
}

