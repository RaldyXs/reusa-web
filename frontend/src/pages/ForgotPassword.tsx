import {
  ArrowLeft,
  Mail,
  Send,
} from "lucide-react";
import {
  type FormEvent,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  solicitarRecuperacion,
} from "../services/recuperacionService";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  const [mensaje, setMensaje] =
    useState("");

  const [error, setError] =
    useState("");

  async function manejarEnvio(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const correo =
      email.trim().toLowerCase();

    setMensaje("");
    setError("");

    if (!correo) {
      setError(
        "Debes escribir tu correo electrónico.",
      );

      return;
    }

    try {
      setCargando(true);

      const respuesta =
        await solicitarRecuperacion(
          correo,
        );

      setMensaje(respuesta);
      setEmail("");
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo solicitar la recuperación.",
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
          Recuperar contraseña
        </h1>

        <p className="login-description">
          Escribe el correo asociado a tu
          cuenta y te enviaremos un enlace
          para crear una nueva contraseña.
        </p>

        {mensaje && (
          <div
            className="success-message"
            role="status"
          >
            {mensaje}
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
                required
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={cargando}
          >
            <Send size={18} />

            {cargando
              ? "Enviando..."
              : "Enviar enlace"}
          </button>
        </form>

        <button
          className="login-back"
          type="button"
          onClick={() =>
            navigate("/login")
          }
        >
          <ArrowLeft size={17} />
          Volver a iniciar sesión
        </button>
      </section>
    </main>
  );
}

export default ForgotPassword;