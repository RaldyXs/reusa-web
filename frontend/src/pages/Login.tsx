import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
  UserPlus,
} from "lucide-react";
import {
  type FormEvent,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

interface EstadoNavegacion {
  desde?: string;
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    logout,
  } = useAuth();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    contrasena,
    setContrasena,
  ] = useState("");

  const [
    mostrarContrasena,
    setMostrarContrasena,
  ] = useState(false);

  const [
    cargando,
    setCargando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function manejarEnvio(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError("");

    if (
      !email.trim() ||
      !contrasena
    ) {
      setError(
        "Debes escribir el correo y la contraseña.",
      );

      return;
    }

    try {
      setCargando(true);

      /*
       * Elimina cualquier sesión anterior antes
       * de iniciar con la cuenta escrita.
       */
      logout();

      const usuarioAutenticado =
        await login(
          email
            .trim()
            .toLowerCase(),
          contrasena,
        );

      if (
        usuarioAutenticado.rol ===
        "administrador"
      ) {
        navigate("/admin", {
          replace: true,
        });

        return;
      }

      const estado =
        location.state as
          | EstadoNavegacion
          | null;

      const destinoAnterior =
        estado?.desde &&
        !estado.desde.startsWith(
          "/admin",
        )
          ? estado.desde
          : "/";

      navigate(
        destinoAnterior,
        {
          replace: true,
        },
      );
    } catch (
      errorDesconocido
    ) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo iniciar sesión",
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
          Iniciar sesión
        </h1>

        <p className="login-description">
          Accede a tu cuenta para publicar,
          comprar y administrar tus artículos.
        </p>

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
          onSubmit={
            manejarEnvio
          }
        >
          <label>
            <span>
              Correo electrónico
            </span>

            <div className="login-input">
              <Mail size={18} />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                placeholder="correo@ejemplo.com"
                autoComplete="email"
              />
            </div>
          </label>

          <label>
            <span>
              Contraseña
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
                value={
                  contrasena
                }
                onChange={(event) =>
                  setContrasena(
                    event.target.value,
                  )
                }
                placeholder="Escribe tu contraseña"
                autoComplete="current-password"
              />

              <button
                className="login-password-toggle"
                type="button"
                aria-label={
                  mostrarContrasena
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
                title={
                  mostrarContrasena
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
                onClick={() =>
                  setMostrarContrasena(
                    (
                      estadoActual,
                    ) =>
                      !estadoActual,
                  )
                }
              >
                {mostrarContrasena ? (
                  <EyeOff
                    size={18}
                  />
                ) : (
                  <Eye
                    size={18}
                  />
                )}
              </button>
            </div>
          </label>

          <div className="login-forgot-password">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/recuperar-contrasena",
                )
              }
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={cargando}
          >
            <LogIn size={18} />

            {cargando
              ? "Ingresando..."
              : "Iniciar sesión"}
          </button>
        </form>

        <button
          className="login-back"
          type="button"
          onClick={() =>
            navigate(
              "/registro",
            )
          }
        >
          <UserPlus size={17} />
          Crear una cuenta
        </button>

        <button
          className="login-back"
          type="button"
          onClick={() =>
            navigate("/")
          }
        >
          Volver al Marketplace
        </button>
      </section>
    </main>
  );
}

export default Login;