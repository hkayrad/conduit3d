import { Outlet } from "react-router";
import Header from "./shared/header/Header";
import Loader from "./shared/loader/Loader";

/**
 * App component is the main entry point of the application.
 * @returns The rendered component
 */
export default function App(): React.ReactNode {
    return <>
        <Header />
        <Loader />
        <Outlet />
    </>
}