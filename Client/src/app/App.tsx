import { Outlet } from "react-router";
import Header from "./shared/header/Header";
import Loader from "./shared/loader/Loader";

export default function App() {

    return <>
        <Header />
        <Loader />
        <Outlet />
    </>
}