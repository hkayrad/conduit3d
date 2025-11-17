import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { selectUserState } from "./authSlice";
import { UserRoles } from "../../../lib/enums";
import { hasUserSession } from "../../../lib/utils";

type Props = {
  children: React.ReactNode;
};

/**
 * RequireAuth component is responsible for protecting routes that require authentication.
 * @param param0 The props for the component
 * @returns The rendered component
 */
export function RequireAuth({ children }: Readonly<Props>): React.ReactNode {
  if (!hasUserSession()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * RequireNoAuth component is responsible for protecting routes that should not be accessed by authenticated users.
 * @param param0 The props for the component
 * @returns The rendered component
 */
export function RequireNoAuth({ children }: Readonly<Props>): React.ReactNode {
  if (hasUserSession()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * RequireAdmin component is responsible for protecting routes that require admin access.
 * @param param0 The props for the component
 * @returns The rendered component
 */
export function RequireAdmin({ children }: Readonly<Props>): React.ReactNode {
  const user = useSelector(selectUserState);

  if (!hasUserSession()) {
    return <Navigate to="/login" replace />;
  }

  if (user?.userRole !== UserRoles.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
