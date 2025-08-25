import { Outlet } from "react-router";
import Header from "./shared/header/Header";
import { useAppSelector } from "../lib/hooks";
import { selectUserState } from "./layout/auth/authSlice";
import { useEffect } from "react";

export default function App() {
    const user = useAppSelector(selectUserState);

    useEffect(() => {
        console.table(user);
    }, [user]);

    return <>
        <Header />
        <Outlet />
    </>
}