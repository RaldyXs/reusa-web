import type { ReactNode } from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";

import type { RolUsuario } from "../../interfaces/auth";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  rolesPermitidos?: RolUsuario[];
}

function ProtectedRoute({
  children,
  rolesPermitidos,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { autenticado, usuario } = useAuth();

  if (!autenticado || !usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          desde: location.pathname,
        }}
      />
    );
  }

  if (
    rolesPermitidos &&
    !rolesPermitidos.includes(usuario.rol)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;