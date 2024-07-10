import * as yup from 'yup';
import { Formik, Form, Field } from 'formik';
import {Address} from "../../models/Address";
import {auth, axiosInstance} from "../../utils/firebase";
import {useRouter} from "next/router";
import G from "glob";
import { Card, CardContent, Typography, Grid, TextField, Button, Box, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import useAuthContext from "../../hooks/useAuthContext";
import Toast, {ToastState, ToastType, Alert} from "../Toast";
import useToastContext from "../../hooks/useToastContext";


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

//Optional Address
export default function AddressForm({address}: {address?: Address}) {
    const router = useRouter();
    const useAuth = useAuthContext();
    const toast = useToastContext();

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
            const path = address ? ADDRESS_URL + `/${address.id}` : ADDRESS_URL;
            const response = await axiosInstance.post(path, json); // Update the address

            const message = address ? "Address updated" : "Address saved";
            toast.show(message, ToastType.SUCCESS);
            router.push("/user/address/page"); // Redirect to the addresses list after saving
        } catch (error) {
            console.error("Error updating address:", error);
        }
    };

    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Address
                </Typography>
                <Formik
                    initialValues={{
                        firstName: address?.firstName || '',
                        lastName: address?.lastName || '',
                        unit: address?.street || '',
                        street: address?.street || '',
                        city: address?.city || '',
                        state: address?.state || '', // Include state in initial values
                        postcode: address?.postalCode || '',
                        country: address?.country || 'US',
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
                            <Button type="submit" variant="contained" color="primary">Submit</Button>
                        </Form>
                    )}
                </Formik>
            </CardContent>
        </Card>
    );
}