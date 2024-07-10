
import React, {useEffect, useState} from 'react';
import {Address} from "../../models/Address";
import {auth, axiosInstance} from "../../utils/firebase";
import Box from "@mui/material/Box";
import {
    Button,
    Card,
    CardContent,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import {useRouter} from "next/router";
import useSWR from "swr";
import Select from "@mui/material/Select";
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import AddHomeIcon from "@mui/icons-material/AddHome";
import Divider from "@mui/material/Divider";
import {Field, Form, Formik} from "formik";
import useAuthContext from "../../hooks/useAuthContext";
import useToastContext from "../../hooks/useToastContext";
import {ToastType} from "../Toast";
import * as yup from "yup";
import {Invoice} from "../../models/Invoice";

const schema = yup.object().shape({
    firstName: yup.string()
        .required("First name is required"),
    lastName: yup.string()
        .required("Last name is required"),
    unit: yup.string(),
    street: yup.string()
        .min(5, "Too Short!")
        .required("Street is required"),
    city: yup.string()
        .min(2, "Too Short!")
        .required("City is required"),
    state: yup.string().required('State is required'), // Ensure state is required
    postcode: yup.string()
        .matches(/^[0-9]+$/, "Must be only digits")
        .min(5, "Too Short!")
        .required("Postcode is required")
});

const states = [
    { name: 'Alabama', abbreviation: 'AL' },
    { name: 'Alaska', abbreviation: 'AK' },
    { name: 'Arizona', abbreviation: 'AZ' },
    { name: 'Arkansas', abbreviation: 'AR' },
    { name: 'California', abbreviation: 'CA' },
    { name: 'Colorado', abbreviation: 'CO' },
    { name: 'Connecticut', abbreviation: 'CT' },
    { name: 'Delaware', abbreviation: 'DE' },
    { name: 'Florida', abbreviation: 'FL' },
    { name: 'Georgia', abbreviation: 'GA' },
    { name: 'Hawaii', abbreviation: 'HI' },
    { name: 'Idaho', abbreviation: 'ID' },
    { name: 'Illinois', abbreviation: 'IL' },
    { name: 'Indiana', abbreviation: 'IN' },
    { name: 'Iowa', abbreviation: 'IA' },
    { name: 'Kansas', abbreviation: 'KS' },
    { name: 'Kentucky', abbreviation: 'KY' },
    { name: 'Louisiana', abbreviation: 'LA' },
    { name: 'Maine', abbreviation: 'ME' },
    { name: 'Maryland', abbreviation: 'MD' },
    { name: 'Massachusetts', abbreviation: 'MA' },
    { name: 'Michigan', abbreviation: 'MI' },
    { name: 'Minnesota', abbreviation: 'MN' },
    { name: 'Mississippi', abbreviation: 'MS' },
    { name: 'Missouri', abbreviation: 'MO' },
    { name: 'Montana', abbreviation: 'MT' },
    { name: 'Nebraska', abbreviation: 'NE' },
    { name: 'Nevada', abbreviation: 'NV' },
    { name: 'New Hampshire', abbreviation: 'NH' },
    { name: 'New Jersey', abbreviation: 'NJ' },
    { name: 'New Mexico', abbreviation: 'NM' },
    { name: 'New York', abbreviation: 'NY' },
    { name: 'North Carolina', abbreviation: 'NC' },
    { name: 'North Dakota', abbreviation: 'ND' },
    { name: 'Ohio', abbreviation: 'OH' },
    { name: 'Oklahoma', abbreviation: 'OK' },
    { name: 'Oregon', abbreviation: 'OR' },
    { name: 'Pennsylvania', abbreviation: 'PA' },
    { name: 'Rhode Island', abbreviation: 'RI' },
    { name: 'South Carolina', abbreviation: 'SC' },
    { name: 'South Dakota', abbreviation: 'SD' },
    { name: 'Tennessee', abbreviation: 'TN' },
    { name: 'Texas', abbreviation: 'TX' },
    { name: 'Utah', abbreviation: 'UT' },
    { name: 'Vermont', abbreviation: 'VT' },
    { name: 'Virginia', abbreviation: 'VA' },
    { name: 'Washington', abbreviation: 'WA' },
    { name: 'West Virginia', abbreviation: 'WV' },
    { name: 'Wisconsin', abbreviation: 'WI' },
    { name: 'Wyoming', abbreviation: 'WY' },
];


const ADDRESS_URL = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/users/address`;
const INVOICE_URL = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/invoice`;


// SWR fetcher function using axiosInstance and Firebase authentication
const fetcher = async (url: string) => {
    const token = await auth.currentUser?.getIdToken(true); // Fetch Firebase Auth token
    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Add the token to the headers
        },
    };
    const response = await axiosInstance.get(url, config); // Use axios to fetch data

    if (response.status !== 200) {
        throw new Error('Failed to fetch data'); // Handle non-200 status
    }

    return response.data; // Return the data from the response
};


//{address}: {address?: Address}
const AddressSelector = ({ invoice, setInvoice }: { invoice: Invoice, setInvoice: (invoice: Invoice) => void }) => {
    const router = useRouter();
    const useAuth = useAuthContext();
    const toast = useToastContext();

    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [update, setUpdate] = useState(false);

    const [selectedAddress, setSelectedAddress] = useState(invoice.address);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [user, setUser] = useState(null);
    const [updateAddress, setUpdateAddress] = useState<Address | null>(null);


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            // @ts-ignore
            setUser(authUser); // Set user when authentication state changes
        });

        return () => unsubscribe(); // Cleanup on component unmount
    }, []);

    // Fetch addresses with SWR
    // Redirect to login if user is not authenticated
    useEffect(() => {
        // Only fetch if the user is authenticated
        fetcher(ADDRESS_URL).then((data) => {
            setAddresses(data);
        }
        ).catch((error) => {
            console.error(error);
        });
    }, [user, router]);

    function onExpand() {
        setExpanded(!expanded);
    }

   async function onSelect(id: string) {
        const selected = addresses.find((address) => address.id === id);
        if (selected) {
            //Update invoice with selected address

            try {
                if (!useAuth.isAuthenticated) {
                    toast.show("You must be logged in to add an address", ToastType.ERROR);
                    return;
                }

                let addressRequest = {
                    firstName: selected.firstName,
                    lastName: selected.lastName,
                    street: selected.street,
                    city: selected.city,
                    state: selected.state,
                    postcode: selected.postalCode,
                    country: selected.country,
                }
                const json = JSON.stringify(addressRequest);

                const token = await auth.currentUser?.getIdToken();
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const response = await axiosInstance.post(INVOICE_URL, json);
                //update invoice
                setInvoice(response.data);
                setSelectedAddress(selected);

                return
            } catch (error) {
                console.error('Failed to update invoice', error);
                toast.show("Failed to update invoice", ToastType.ERROR);
            }

        }
    }

    const onSubmit = async (values: any) => {
        // Implement your save logic here
        try {
            if (!useAuth.isAuthenticated) {
                toast.show("You must be logged in to add an address", ToastType.ERROR);
                router.push("/login");
                return;
            }

            //get token
            const token = await auth.currentUser?.getIdToken();
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const json = JSON.stringify(values);
            const path = updateAddress ? ADDRESS_URL + `/${updateAddress.id}` : ADDRESS_URL;
            const response = await axiosInstance.post(path, json); // Update the address

            const message = updateAddress ? "Address updated" : "Address saved";

            //if updateAddress is true, update the address otherwise add the address
            if (updateAddress) {
                const index = addresses.findIndex((address) => address.id === updateAddress.id);
                addresses[index] = response.data;
            } else {
                addresses.push(response.data);
            }
            setAddresses([...addresses]);
            setUpdate(false);
            toast.show(message, ToastType.SUCCESS);
        } catch (error) {
            console.error('Failed to save address', error);
            toast.show("Failed to save address", ToastType.ERROR);
            setUpdate(false);
            setUpdateAddress(null);
        }
    };


    function AddressSelector() {

        return (
            <Box>
                    <Box className="flex flex-row gap-2 items-center cursor-pointer p-2"
                       onClick={onExpand}
                     >
                    <RadioButtonCheckedIcon color={'primary'}/>
                    <Box className="flex-grow w-full">
                        <Typography variant="body1" component="div">
                            {selectedAddress!.firstName} {selectedAddress!.lastName}
                        </Typography>
                        <Typography variant="body1" component="div">
                            {selectedAddress!.street}
                        </Typography>
                        <Typography variant="body1" component="div">
                            {selectedAddress!.city}, {selectedAddress!.state} {selectedAddress!.postalCode}
                        </Typography>
                    </Box>

                    <Box className="flex-grow">
                        {expanded ? <ExpandLess/> : <ExpandMore/>}
                    </Box>
                </Box>

                <Box className={"p-2 w-full"}
                           sx={{
                               display: expanded ? 'block' : 'none',
                               transition: 'all 1s ease',
                               transform: expanded ? 'translateY(0)' : 'translateY(-100%)',
                           }}
                >
                    {addresses.map((address: Address, index: number) => (
                        <>
                            <Box key={index}
                                 sx={{
                                     pt: 1,
                                     pb: 1,
                                     display: selectedAddress!.id !== address.id ? 'block' : 'none',
                                 }}
                             >

                            <Box className="flex flex-row gap-2 items-center"
                            >
                                <RadioButtonUncheckedIcon/>
                                <Box>
                                    <Typography variant="body1" component="div">
                                        {address.firstName} {address.lastName}
                                    </Typography>
                                    <Typography variant="body1" component="div">
                                        {address.street}
                                    </Typography>
                                    <Typography variant="body1" component="div">
                                        {address.city}, {address.state} {address.postalCode}
                                    </Typography>

                                    <Box className={"flex flex-row gap-2 items-center"}>
                                        <button className="text-blue-500 underline"
                                                onClick={() => onSelect(address.id!)}
                                        >
                                            Select
                                        </button>

                                        <Divider orientation="vertical" flexItem className={"bg-zinc-400"}/>

                                        <button className="text-blue-500 underline"
                                                onClick={() => {
                                                    setUpdate(true);
                                                    setUpdateAddress(address);
                                                }}>
                                            Edit
                                        </button>
                                    </Box>
                                </Box>

                            </Box>

                        </Box></>
                    ))}

                    <Box>
                        <Divider className={"bg-zinc-500 m-1"}/>

                        <IconButton className={""}
                                    onClick={() => setUpdate(true)}
                        >
                            <Box className="flex flex-row items-center">
                                <AddHomeIcon
                                    className={"text-blue-700"}
                                    sx={{fontSize: 40, pr: 1}}/>
                                <Typography variant="body1" component="div">
                                New Address
                                </Typography>
                            </Box>
                        </IconButton>

                        <Divider className={"bg-zinc-500 m-1"}/>

                    </Box>
                </Box>
            </Box>
        )
    }

    function UpdateAddress() {
        return (
            <Box>
                <Formik
                    initialValues={{
                        firstName: updateAddress?.firstName || '',
                        lastName: updateAddress?.lastName || '',
                        unit: updateAddress?.street || '',
                        street: updateAddress?.street || '',
                        city: updateAddress?.city || '',
                        state: updateAddress?.state || '', // Include state in initial values
                        postcode: updateAddress?.postalCode || '',
                        country: updateAddress?.country || 'US',
                    }}
                    validationSchema={schema}
                    onSubmit={(values) => {
                        console.log(values);
                        onSubmit(values);
                    }}

                >
                    {({ errors, touched }) => (
                        <Form>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={8}>
                                    <div>
                                        <Field as={TextField} name="firstName" label="First Name" variant="outlined" style={{ width: '100%'}} />
                                        {errors.firstName && touched.firstName ? (
                                            <div>{errors.firstName}</div>
                                        ) : null}
                                    </div>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <div>
                                        <Field as={TextField} name="lastName" label="Last Name" variant="outlined" style={{ width: '100%'}}/>
                                        {errors.lastName && touched.lastName ? (
                                            <div>{errors.lastName}</div>
                                        ) : null}
                                    </div>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <div>
                                        <Field as={TextField} name="unit" label="Unit" variant="outlined" style={{ width: '100%'}} />
                                        {errors.unit && touched.unit ? (
                                            <div>{errors.unit}</div>
                                        ) : null}
                                    </div>
                                </Grid>

                                <Grid item xs={12} sm={8}>
                                    <div>
                                        <Field as={TextField} name="street" label="Street" variant="outlined" style={{ width: '100%'}} />
                                        {errors.street && touched.street ? (
                                            <div>{errors.street}</div>
                                        ) : null}
                                    </div>
                                </Grid>

                                <Grid item xs={12} sm={8}>
                                    <div>
                                        <Field as={TextField} name="city" label="City" variant="outlined" style={{ width: '100%'}} />
                                        {errors.city && touched.city ? (
                                            <div>{errors.city}</div>
                                        ) : null}
                                    </div>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>State</InputLabel>
                                        <Field
                                            as={Select}
                                            name="state"
                                            label="State"
                                            variant="outlined"
                                            fullWidth
                                        >
                                            {states.map((state) => (
                                                <MenuItem key={state.abbreviation} value={state.abbreviation}>
                                                    {state.name}
                                                </MenuItem>
                                            ))}
                                        </Field>
                                        {errors.state && touched.state ? (
                                            <Typography color="error">{errors.state}</Typography>
                                        ) : null}
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <div>
                                        <Field as={TextField} name="postcode" label="Postcode" variant="outlined" style={{ width: '100%'}} />
                                        {errors.postcode && touched.postcode ? (
                                            <div>{errors.postcode}</div>
                                        ) : null}
                                    </div>
                                </Grid>
                            </Grid>
                            <br />

                            <Box className={"flex flex-row gap-2"}>
                                <Button type="submit" variant="contained" color="primary">Submit</Button>
                                <Button
                                    onClick={() =>
                                    {
                                        setUpdate(false);
                                        setUpdateAddress(null);
                                    }} variant="contained" color="primary">
                                    Cancel</Button>
                            </Box>

                        </Form>
                    )}
                </Formik>
            </Box>
        )
    }


    return (
        <div>
            {/* Default Address */}
            <Card>
                <CardContent>
                    <Typography variant="h6" component="div">
                        {updateAddress ? "Update Address" : "Shipping"}
                    </Typography>
                    <Divider className={"bg-zinc-500 m-1"}/>
                    {addresses.length === 0 && (
                        <Typography variant="body1" component="div">
                            No addresses found
                        </Typography>
                    )}

                    {update && <UpdateAddress/>}
                    {!update && <AddressSelector/>}
                </CardContent>

            </Card>

        </div>
    );
};

export default AddressSelector;
