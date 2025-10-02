import "./style/header.css"
import Logo from "./components/Logo";
import Links from "./components/Links";
import { NavLink } from "react-router";

/**
 * Header component displays the application header.
 * @component
 * @returns The rendered component
 */
export default function Header(): React.ReactNode {

    return (
        <>
            <NavLink to="/" id="logo-container" className="shadow">
                <Logo />
            </NavLink>
            <Links />
        </>
    );
}