
import {Fragment, useState} from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigationBar from "./navigation/NavigationBar";
import { useRouter } from 'next/router';


const DashboardLayoutRoot = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('sm')]: {
        paddingTop: 0,
    },
    [theme.breakpoints.up('md')]: {
        paddingLeft: 0,
        paddingTop: 0,
        marginTop: 0,
    }
}));

export const Layout = (props: { children: any; }) => {
    const { children } = props;
    const router = useRouter();

    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    const transparentRoutes = ['/', '/movie/[id]', '/cast/[id]']
    const isTransparent = transparentRoutes.includes(router.pathname);

    return (

        //If not transparent, use add padding top to the layout
            <Box
                className="w-full h-full bg-black"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    paddingTop: isTransparent ? 0 : 10,
                }}
            >
                <NavigationBar isTransparent={isTransparent} />
                {children}
            </Box>
    );
};
