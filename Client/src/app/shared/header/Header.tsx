import "./style/header.css"
import Links from "./components/Links";
import { NavLink } from "react-router";
import Logo from "../logo/Logo";

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