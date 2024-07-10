import Navbar from "react-bootstrap/Navbar";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {Movie} from "../../models/Movie";
import NavigationActionItems from "./NavigationActionItems";
import TheatersIcon from '@mui/icons-material/Theaters';
import {Nav, NavDropdown, Container} from "react-bootstrap";
import SearchBar from "./SearchBar";
import {boolean} from "yup";


interface NavigationBarProps {
    isTransparent?: boolean
}

function NavigationBar({isTransparent}: NavigationBarProps) {
    const router = useRouter();
    const ref = React.useRef() as React.MutableRefObject<HTMLDivElement>;
    const [scrolled, setScrolled] = useState(false);


    useEffect(() => {
        const handleScroll = () => {
            if (ref.current) {
                const offset = window.scrollY;
                if (offset > 50) {
                    setScrolled(true);
                } else {
                    setScrolled(false);
                }
            }
        }
        window.addEventListener('scroll', handleScroll)

    }, [])


    return (
        <Navbar
            ref={ref}
            className="fixed-top transition-all duration-500 ease-in-out bg-blue-700"
            style={
                isTransparent ? {
                    backgroundColor: scrolled ? '#141414' : 'transparent',
                    boxShadow: scrolled ? '0 0 10px #000' : 'none',
                } : {
                    backgroundColor: '#141414',
                    boxShadow: '0 0 10px #000'
                }
            }
            collapseOnSelect expand="lg">
            <Container className={"flex flex-row w-full "}>
                <Navbar.Brand href="/" className={"hidden lg:block"}>
                    <TheatersIcon fontSize={'large'} color={'primary'}/>
                </Navbar.Brand>
                <Nav.Item className={"flex flex-row border-blue-400"}>
                    <SearchBar/>
                </Nav.Item>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse>
                    <Nav className="ml-auto"
                         style={{
                             color: '#197EFF',
                    }}
                    >
                        <NavigationActionItems/>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavigationBar;