"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LocalMoviesRoundedIcon from "@mui/icons-material/LocalMoviesRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "@/lib/firebase/AuthContext";
import { signOut } from "@/lib/firebase/signOut";

const DRAWER_WIDTH = 232;

/** The screens from WORKPLAN item 42, in the old dashboard's order. */
const NAV = [
    { href: "/", label: "Dashboard", icon: <DashboardRoundedIcon /> },
    { href: "/products", label: "Products", icon: <LocalMoviesRoundedIcon /> },
    { href: "/customers", label: "Customers", icon: <PeopleRoundedIcon /> },
    { href: "/orders", label: "Orders", icon: <ReceiptLongRoundedIcon /> },
    { href: "/reviews", label: "Reviews", icon: <RateReviewRoundedIcon /> },
];

function isActive(pathname: string, href: string): boolean {
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    async function handleSignOut() {
        setSigningOut(true);
        try {
            await signOut();
        } catch (e) {
            console.warn("Sign out failed", e);
            setSigningOut(false);
        }
    }

    const nav = (
        <>
            <Toolbar>
                <Typography variant="h6" component="span" fontWeight={700} noWrap>
                    MovieDB Admin
                </Typography>
            </Toolbar>
            <Divider />
            <List component="nav" aria-label="Sections" sx={{ px: 1 }}>
                {NAV.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                        <ListItemButton
                            key={item.href}
                            component={Link}
                            href={item.href}
                            selected={active}
                            aria-current={active ? "page" : undefined}
                            onClick={() => setMobileOpen(false)}
                            sx={{ borderRadius: 1, mb: 0.5 }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    );
                })}
            </List>
        </>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <AppBar
                position="fixed"
                color="inherit"
                elevation={0}
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                    borderBottom: 1,
                    borderColor: "divider",
                }}
            >
                <Toolbar sx={{ gap: 1 }}>
                    <IconButton
                        edge="start"
                        aria-label="Open navigation"
                        onClick={() => setMobileOpen(true)}
                        sx={{ display: { md: "none" } }}
                    >
                        <MenuRoundedIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    {user?.email && (
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ minWidth: 0 }}>
                            {user.email}
                        </Typography>
                    )}
                    <Button
                        color="inherit"
                        onClick={handleSignOut}
                        disabled={signingOut}
                        startIcon={<LogoutRoundedIcon />}
                        sx={{ flexShrink: 0 }}
                    >
                        {signingOut ? "Signing out" : "Sign out"}
                    </Button>
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
                >
                    {nav}
                </Drawer>
                <Drawer
                    variant="permanent"
                    open
                    sx={{ display: { xs: "none", md: "block" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
                >
                    {nav}
                </Drawer>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3 } }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}
