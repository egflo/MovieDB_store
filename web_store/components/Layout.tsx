
import {Fragment, useState} from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigationBar from "./navigation/NavigationBar";

const DashboardLayoutRoot = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('sm')]: {
        paddingTop: 0,
    },
    [theme.breakpoints.up('md')]: {
        paddingLeft: 0,
        paddingTop: 0,
    }
}));

export const Layout = (props: { children: any; }) => {
    const { children } = props;

    return (
        <Fragment>

            <DashboardLayoutRoot>
                <NavigationBar />

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {children}
                    </div>

            </DashboardLayoutRoot>
        </Fragment>
    );
};
