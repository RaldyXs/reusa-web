import {
  type ReactNode,
  useMemo,
  useState,
} from "react";

import type {
  Sesion,
  UsuarioSesion,
} from "../interfaces/auth";

import { iniciarSesion as solicitarLogin } from "../services/authService";
import {
  AuthContext,
  type AuthContextValue,
} from "./auth-context";

interface AuthProviderProps {
  children: ReactNode;
}

const CLAVE_SESION = "reusa_sesion";

function leerSesionGuardada(): Sesion | null {
  const valorGuardado =
    localStorage.getItem(CLAVE_SESION);

  if (!valorGuardado) {
    return null;
  }

  try {
    const sesion =
      JSON.parse(valorGuardado) as Sesion;

    if (
      !sesion.token ||
      !sesion.usuario ||
      !sesion.usuario.usuarioId
    ) {
      localStorage.removeItem(CLAVE_SESION);
      return null;
    }

    return sesion;
  } catch {
    localStorage.removeItem(CLAVE_SESION);
    return null;
  }
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [sesion, setSesion] =
    useState<Sesion | null>(() =>
      leerSesionGuardada(),
    );

  async function login(
    email: string,
    contrasena: string,
  ): Promise<UsuarioSesion> {
    const nuevaSesion = await solicitarLogin(
      email,
      contrasena,
    );

    localStorage.setItem(
      CLAVE_SESION,
      JSON.stringify(nuevaSesion),
    );

    setSesion(nuevaSesion);

    return nuevaSesion.usuario;
  }

  function logout(): void {
    localStorage.removeItem(CLAVE_SESION);
    setSesion(null);
  }

  const valor = useMemo<AuthContextValue>(
    () => ({
      usuario: sesion?.usuario ?? null,
      token: sesion?.token ?? null,
      autenticado: Boolean(
        sesion?.token && sesion.usuario,
      ),
      login,
      logout,
    }),
    [sesion],
  );

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}