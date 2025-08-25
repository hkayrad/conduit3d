import { useState } from "react";

export default function UserButton() {
    const [isUserCardOpen, setIsUserCardOpen] = useState<boolean>(false);

    return (
        <button onClick={() => setIsUserCardOpen(!isUserCardOpen)}>

        </button>
    )
}