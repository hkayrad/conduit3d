import "./style/header.css"
import Logo from "./components/Logo";
import Actions from "./components/Actions";
import { NavLink } from "react-router";

/**
 * Header component displays the application header.
 * @component
 * @returns The rendered component
 */
export default function Header(): React.ReactNode {

    return (
        <div id="header">
            <NavLink to="/" id="logo-container" className="shadow">
                <Logo />
            </NavLink>
            <Actions />
        </div>
    );
}