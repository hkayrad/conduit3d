import { Navigate } from "react-router"

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