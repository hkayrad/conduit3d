import "./style/header.css"
import Logo from "./components/Logo";
import Actions from "./components/Actions";
import { NavLink } from "react-router";

export default function Header() {
    return (
        <div id="header">
            <NavLink to="/">
                <Logo />
            </NavLink>
            <Actions />
        </div>
    );
}