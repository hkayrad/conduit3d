import "./style/header.css"
import Logo from "./components/Logo";
import Actions from "./components/Actions";
import { NavLink } from "react-router";
import type { JSX } from "react";

/**
 * Header component displays the application header.
 * @component
 * @returns {JSX.Element} The rendered component
 */
export default function Header(): JSX.Element {

    return (
        <div id="header">
            <NavLink to="/" id="logo-container" className="shadow">
                <Logo />
            </NavLink>
            <Actions />
        </div>
    );
}