import { createContext } from "react";

import type { UsuarioSesion } from "../interfaces/auth";

export interface AuthContextValue {
  usuario: UsuarioSesion | null;
  token: string | null;
  autenticado: boolean;

  login: (
    email: string,
    contrasena: string,
  ) => Promise<UsuarioSesion>;

  logout: () => void;
}

export const AuthContext =
  createContext<AuthContextValue | null>(null);