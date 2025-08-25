import { useEffect } from "react";
import AdrBinaApi from "../../../../lib/api/adrBina";
import { useAppSelector, useAppDispatch } from "../../../../lib/hooks"

export default function AdrBina() {
    const dispatch = useAppDispatch();
    const adrBina = useAppSelector((state) => state.adrBina.value);

    const handleFetchAdrBina = async () => {
        try {
            const response = await AdrBinaApi.fetchAll();
            if (response.isSuccess) {
                dispatch({ type: "adrBina/setValue", payload: response.data });
            }
        } catch (error) {
            console.error("Error fetching adrBina:", error);
        }
    }

    useEffect(() => {
        handleFetchAdrBina();
    }, [])

    useEffect(() => {
        console.log("adrBina updated:", adrBina);
    }, [adrBina]);

    return null;
}