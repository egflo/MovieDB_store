import Navbar from "react-bootstrap/Navbar";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {Movie} from "../../models/Movie";
import NavigationActionItems from "./NavigationActionItems";
import TheatersIcon from '@mui/icons-material/Theaters';
import { Nav, NavDropdown, Container } from "react-bootstrap";
import SearchBar from "./SearchBar";


function NavigationBar() {
    const router = useRouter();
    const [value, setValue] = useState<Movie | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState(new Array<Movie>());
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [scroll, setScroll] = useState(false);

    useEffect(() => {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 100) {
                setScroll(true);
            } else setScroll(false);
        });
    }, []);





    return (
        <Navbar sticky="top" className="bg-black opacity-100  fixed-top "  collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Container className={"flex flex-row  w-full"}>
                <Navbar.Brand href="/">
                    <TheatersIcon fontSize={'large'}  color={'primary'}/>
                </Navbar.Brand>
                <Nav.Item className={"flex flex-row"}>
                <SearchBar />
                </Nav.Item>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav justify-content-end" style={{color:'#197EFF'}}>
                    <Nav className="me-auto">
                        <NavigationActionItems/>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
  );
}

export default NavigationBar;