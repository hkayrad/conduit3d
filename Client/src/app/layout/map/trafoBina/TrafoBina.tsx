import { useEffect } from "react";
import TrafoBinaApi from "../../../../lib/api/trafoBina";
import { useAppDispatch } from "../../../../lib/hooks"


export default function TrafoBina() {
    const dispatch = useAppDispatch();

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

    return null;
}