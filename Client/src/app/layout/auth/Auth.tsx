import { useSelector } from "react-redux"
import { Navigate } from "react-router"
import { selectUserState } from "./authSlice"
import { UserRoles } from "../../../lib/enums"

type Props = {
    children: React.ReactNode
}

/**
 * Checks if the user has an active session.
 * @returns True if the user has a session, false otherwise.
 */
function hasUserSession(): boolean {
    // Check for user session cookie
    return document.cookie.includes('user_session=')
}

/**
 * RequireAuth component is responsible for protecting routes that require authentication.
 * @param param0 The props for the component
 * @returns The rendered component
 */
export function RequireAuth({ children }: Props): React.ReactNode {
    if (!hasUserSession()) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

/**
 * RequireNoAuth component is responsible for protecting routes that should not be accessed by authenticated users.
 * @param param0 The props for the component
 * @returns The rendered component
 */
export function RequireNoAuth({ children }: Props): React.ReactNode {
    if (hasUserSession()) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

/**
 * RequireAdmin component is responsible for protecting routes that require admin access.
 * @param param0 The props for the component
 * @returns The rendered component
 */
export function RequireAdmin({ children }: Props): React.ReactNode {
    const user = useSelector(selectUserState);

    if (user?.userRole !== UserRoles.ADMIN) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}