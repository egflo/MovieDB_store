'use client';

import React from "react";
import Link from "next/link";
import IconButton from "@mui/material/IconButton";
import LoginIcon from "@mui/icons-material/Login";

/**
 * Links to the sign-in page. web_store opened a modal LoginForm here, but
 * web_app authenticates through a real /login route so the edge middleware
 * can set the session cookie on redirect.
 */
export function Login() {
    return (
        <IconButton
            component={Link}
            href="/login"
            size="large"
            edge="end"
            color="inherit"
            aria-label="Sign in"
        >
            <div className="flex flex-row items-center gap-2">
                <LoginIcon fontSize="medium" />
                <span className="block text-base md:hidden">Sign in</span>
            </div>
        </IconButton>
    );
}

export default Login;
