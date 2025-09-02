import { Outlet } from "react-router";
import Header from "./shared/header/Header";
import Loader from "./shared/loader/Loader";
import type { JSX } from "react";

/**
 * App component is the main entry point of the application.
 * @returns {JSX.Element} The rendered component
 */
export default function App(): JSX.Element {
    return <>
        <Header />
        <Loader />
        <Outlet />
    </>
}