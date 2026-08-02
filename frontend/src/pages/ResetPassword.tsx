import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import {
  type FormEvent,
  useState,
} from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  restablecerContrasena,
} from "../services/recuperacionService";

function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token")?.trim() ??
    "";

  const [
    contrasena,
    setContrasena,
  ] = useState("");

  const [
    confirmarContrasena,
    setConfirmarContrasena,
  ] = useState("");

  const [
    mostrarContrasena,
    setMostrarContrasena,
  ] = useState(false);

  const [
    mostrarConfirmacion,
    setMostrarConfirmacion,
  ] = useState(false);

  const [cargando, setCargando] =
    useState(false);

  const [completado, setCompletado] =
    useState(false);

  const [error, setError] =
    useState("");

  async function manejarEnvio(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError("");

    if (!token) {
      setError(
        "El enlace de recuperación no contiene un token válido.",
      );

      return;
    }

    if (contrasena.length < 8) {
      setError(
        "La contraseña debe tener al menos 8 caracteres.",
      );

      return;
    }

    if (
      contrasena !==
      confirmarContrasena
    ) {
      setError(
        "Las contraseñas no coinciden.",
      );

      return;
    }

    try {
      setCargando(true);

      await restablecerContrasena(
        token,
        contrasena,
        confirmarContrasena,
      );

      setCompletado(true);
      setContrasena("");
      setConfirmarContrasena("");
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo restablecer la contraseña.",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-logo">
          R
        </div>

        <span className="login-eyebrow">
          RE-USA MARKETPLACE
        </span>

        <h1>
          Nueva contraseña
        </h1>

        {completado ? (
          <>
            <div
              className="success-message"
              role="status"
            >
              <CheckCircle2 size={18} />

              <span>
                Tu contraseña fue
                restablecida correctamente.
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/login", {
                  replace: true,
                })
              }
            >
              Iniciar sesión
            </button>
          </>
        ) : (
          <>
            <p className="login-description">
              Escribe y confirma la nueva
              contraseña de tu cuenta.
            </p>

            {!token && (
              <div
                className="login-error"
                role="alert"
              >
                El enlace no es válido o
                está incompleto.
              </div>
            )}

            {error && (
              <div
                className="login-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <form
              className="login-form"
              onSubmit={manejarEnvio}
            >
              <label>
                <span>
                  Nueva contraseña
                </span>

                <div className="login-input login-input--password">
                  <LockKeyhole
                    size={18}
                  />

                  <input
                    type={
                      mostrarContrasena
                        ? "text"
                        : "password"
                    }
                    value={contrasena}
                    onChange={(event) =>
                      setContrasena(
                        event.target.value,
                      )
                    }
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    className="login-password-toggle"
                    type="button"
                    aria-label={
                      mostrarContrasena
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    onClick={() =>
                      setMostrarContrasena(
                        (estado) =>
                          !estado,
                      )
                    }
                  >
                    {mostrarContrasena ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>

              <label>
                <span>
                  Confirmar contraseña
                </span>

                <div className="login-input login-input--password">
                  <LockKeyhole
                    size={18}
                  />

                  <input
                    type={
                      mostrarConfirmacion
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmarContrasena
                    }
                    onChange={(event) =>
                      setConfirmarContrasena(
                        event.target.value,
                      )
                    }
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    className="login-password-toggle"
                    type="button"
                    aria-label={
                      mostrarConfirmacion
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    onClick={() =>
                      setMostrarConfirmacion(
                        (estado) =>
                          !estado,
                      )
                    }
                  >
                    {mostrarConfirmacion ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={
                  cargando || !token
                }
              >
                <CheckCircle2
                  size={18}
                />

                {cargando
                  ? "Actualizando..."
                  : "Guardar contraseña"}
              </button>
            </form>

            <button
              className="login-back"
              type="button"
              onClick={() =>
                navigate(
                  "/recuperar-contrasena",
                )
              }
            >
              <ArrowLeft size={17} />
              Solicitar otro enlace
            </button>
          </>
        )}
      </section>
    </main>
  );
}

export default ResetPassword;