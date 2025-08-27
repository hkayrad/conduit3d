import { useSelector } from "react-redux"
import { Navigate } from "react-router"
import { selectUserState } from "./authSlice"
import { UserRoles } from "../../../lib/enums"

type Props = {
    children: React.ReactNode
}

function hasUserSession(): boolean {
    // Check for user session cookie
    return document.cookie.includes('user_session=')
}

export function RequireAuth({ children }: Props) {
    if (!hasUserSession()) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

export function RequireNoAuth({ children }: Props) {
    if (hasUserSession()) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

export function RequireAdmin({ children }: Props) {
    const user = useSelector(selectUserState);

    if (user?.userRole !== UserRoles.ADMIN) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}