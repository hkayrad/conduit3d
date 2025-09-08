import { useState } from "react";

/**
 * UserButton component displays a button for user settings.
 * @component
 * @returns The rendered component
 */
export default function UserButton(): React.ReactNode {
    const [isUserCardOpen, setIsUserCardOpen] = useState<boolean>(false);

    return (
        <button onClick={() => setIsUserCardOpen(!isUserCardOpen)}>

        </button>
    )
}