import { Outlet } from "react-router";
import Header from "./shared/header/Header";

export default function App() {

    return <>
        <Header />
        <Outlet />
    </>
}