import { useContext } from "react";

import {
  AuthContext,
  type AuthContextValue,
} from "../contexts/auth-context";

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider",
    );
  }

  return contexto;
}