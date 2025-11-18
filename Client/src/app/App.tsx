import { Outlet } from "react-router";
import Header from "./shared/header/Header";
import Loader from "./shared/loader/Loader";
import { useCallback, useEffect } from "react";
import { ConfigApi } from "../lib/api";
import { useAppDispatch } from "../lib/hooks";
import { setConfig } from "./configSlice";

/**
 * App component is the main entry point of the application.
 * @returns The rendered component
 */
export default function App(): React.ReactNode {
  const dispatch = useAppDispatch();

  const handleConfigFetch = useCallback(async () => {
    const response = await ConfigApi.fetchConfig();

    if (response.isSuccess)
      dispatch(
        setConfig(
          response.data.reduce(
            (acc, curr) => {
              acc[curr.key] = curr.value;
              return acc;
            },
            {} as Record<string, string>,
          ),
        ),
      );
    else console.error("Failed to fetch config:", response.message);
  }, [dispatch]);

  useEffect(() => {
    handleConfigFetch();
  }, [handleConfigFetch]);

  return (
    <>
      <Header />
      <Loader />
      <Outlet />
    </>
  );
}
