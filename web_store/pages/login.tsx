import {LoginForm} from "../components/LoginForm";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";


export default function LoginPage() {
    return (
        <Box className="login-page"
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100vw',
                    backgroundColor: theme => theme.palette.background.default,
                }}
        >

            <Box style={{width:"400", height:"400"}}>
                <LoginForm/>
            </Box>
        </Box>
    );
}