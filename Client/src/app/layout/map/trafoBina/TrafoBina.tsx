import { useEffect } from "react";
import TrafoBinaApi from "../../../../lib/api/trafoBina";
import { useAppSelector, useAppDispatch } from "../../../../lib/hooks"

export default function TrafoBina() {
    const dispatch = useAppDispatch();
    const trafoBina = useAppSelector((state) => state.trafoBina.value);

    const handleFetchTrafoBina = async () => {
        try {
            const response = await TrafoBinaApi.fetchAll();
            if (response.isSuccess) {
                dispatch({ type: "trafoBina/setValue", payload: response.data });
            }
        } catch (error) {
            console.error("Error fetching trafoBina:", error);
        }
    }

    useEffect(() => {
        handleFetchTrafoBina();
    }, [])

    useEffect(() => {
        console.log("trafoBina updated:", trafoBina);
    }, [trafoBina]);

    return null;
}