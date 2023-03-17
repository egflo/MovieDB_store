import * as yup from 'yup';
import { Formik, Form, Field } from 'formik';
import {Button, Card, CardContent, Typography, TextField, Grid} from '@mui/material';
import Box from "@mui/material/Box";


const schema = yup.object().shape({
    firstname: yup.string()
        .required("First name is required"),
    lastname: yup.string()
        .required("Last name is required"),
    unit: yup.string(),
    street: yup.string()
        .min(5, "Too Short!")
        .required("Street is required"),
    city: yup.string()
        .min(2, "Too Short!")
        .required("City is required"),
    postcode: yup.string()
        .matches(/^[0-9]+$/, "Must be only digits")
        .min(5, "Too Short!")
        .required("Postcode is required")
});


export default function Address() {


    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Address
                </Typography>
                <Formik
                    initialValues={{
                        firstname: '',
                        lastname: '',
                        unit: '',
                        street: '',
                        city: '',
                        postcode: '',
                    }}
                    validationSchema={schema}
                    onSubmit={(values) => {
                        console.log(values);
                    }}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                                <Box gridColumn="span 8">
                                    <div>
                                        <Field as={TextField} name="firstname" label="First Name" variant="outlined" style={{ width: '100%'}} />
                                        {errors.firstname && touched.firstname ? (
                                            <div>{errors.firstname}</div>
                                        ) : null}
                                    </div>
                                </Box>

                                <Box gridColumn="span 4">
                                    <div>
                                        <Field as={TextField} name="lastname" label="Last Name" variant="outlined" style={{ width: '100%'}}/>
                                        {errors.lastname && touched.lastname ? (
                                            <div>{errors.lastname}</div>
                                        ) : null}
                                    </div>
                                </Box>

                                <Box gridColumn="span 4">
                                    <div>
                                        <Field as={TextField} name="unit" label="Unit" variant="outlined" style={{ width: '100%'}} />
                                        {errors.unit && touched.unit ? (
                                            <div>{errors.unit}</div>
                                        ) : null}
                                    </div>
                                </Box>

                                <Box gridColumn="span 8">
                                    <div>
                                        <Field as={TextField} name="street" label="Street" variant="outlined" style={{ width: '100%'}} />
                                        {errors.street && touched.street ? (
                                            <div>{errors.street}</div>
                                        ) : null}
                                    </div>
                                </Box>

                                <Box gridColumn="span 8">
                                    <div>
                                        <Field as={TextField} name="city" label="City" variant="outlined" style={{ width: '100%'}} />
                                        {errors.city && touched.city ? (
                                            <div>{errors.city}</div>
                                        ) : null}
                                    </div>
                                </Box>

                                <Box gridColumn="span 4">
                                    <div>
                                        <Field as={TextField} name="postcode" label="Postcode" variant="outlined" style={{ width: '100%'}} />
                                        {errors.postcode && touched.postcode ? (
                                            <div>{errors.postcode}</div>
                                        ) : null}
                                    </div>
                                </Box>
                            </Box>
                            <br />

                            <Button type="submit" variant="contained" color="primary">Submit</Button>
                        </Form>
                    )}
                </Formik>
            </CardContent>
        </Card>
    );
}