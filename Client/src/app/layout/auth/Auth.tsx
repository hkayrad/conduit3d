import { useSelector } from "react-redux"
import { Navigate } from "react-router"
import { selectUserState } from "./authSlice"
import { UserRoles } from "../../../lib/enums"
import type { JSX } from "react"

type Props = {
    children: React.ReactNode
}

/**
 * Checks if the user has an active session.
 * @returns {boolean} True if the user has a session, false otherwise.
 */
function hasUserSession(): boolean {
    // Check for user session cookie
    return document.cookie.includes('user_session=')
}

/**
 * RequireAuth component is responsible for protecting routes that require authentication.
 * @param param0 The props for the component
 * @returns {JSX.Element} The rendered component
 */
export function RequireAuth({ children }: Props): JSX.Element {
    if (!hasUserSession()) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

/**
 * RequireNoAuth component is responsible for protecting routes that should not be accessed by authenticated users.
 * @param param0 The props for the component
 * @returns {JSX.Element} The rendered component
 */
export function RequireNoAuth({ children }: Props): JSX.Element {
    if (hasUserSession()) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

/**
 * RequireAdmin component is responsible for protecting routes that require admin access.
 * @param param0 The props for the component
 * @returns {JSX.Element} The rendered component
 */
export function RequireAdmin({ children }: Props): JSX.Element {
    const user = useSelector(selectUserState);

    if (user?.userRole !== UserRoles.ADMIN) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}