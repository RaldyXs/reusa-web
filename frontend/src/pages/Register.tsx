import {
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import {
  type CSSProperties,
  type FormEvent,
  useState,
} from "react";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import type {
  RegistroUsuarioDatos,
} from "../interfaces/auth";
import { registrarUsuario } from "../services/authService";

const DATOS_INICIALES: RegistroUsuarioDatos = {
  nombre: "",
  apellido: "",
  email: "",
  contrasena: "",
  confirmarContrasena: "",
  telefono: "",
  ubicacion: "",
};

const estilos: Record<string, CSSProperties> = {
  pagina: {
    minHeight: "100vh",
    padding: "12px 24px",
  },

  tarjeta: {
    width: "min(100%, 760px)",
    padding: "22px 30px",
  },

  encabezado: {
    display: "grid",
    gridTemplateColumns: "48px minmax(0, 1fr)",
    alignItems: "center",
    gap: "14px",
    marginBottom: "14px",
  },

  logo: {
    width: "48px",
    height: "48px",
    marginBottom: 0,
    borderRadius: "13px",
    fontSize: "22px",
  },

  titulo: {
    margin: "3px 0",
    fontSize: "29px",
    lineHeight: 1.05,
  },

  descripcion: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.35,
  },

  formulario: {
    gap: "10px",
  },

  fila: {
    gap: "12px",
  },

  etiqueta: {
    gap: "5px",
    fontSize: "13px",
  },

  campo: {
    minHeight: "40px",
  },

  entrada: {
    height: "40px",
  },

  botonPrincipal: {
    height: "42px",
    marginTop: "2px",
    fontSize: "14px",
  },

  acciones: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "8px",
  },

  botonSecundario: {
    width: "auto",
    marginTop: 0,
    padding: "8px 10px",
    fontSize: "13px",
  },

  separador: {
    color: "#a0aec0",
  },

  mensaje: {
    marginBottom: "10px",
    padding: "9px 12px",
    fontSize: "13px",
  },
};

function Register() {
  const navigate = useNavigate();

  const {
    autenticado,
    usuario,
  } = useAuth();

  const [formulario, setFormulario] =
    useState<RegistroUsuarioDatos>(
      DATOS_INICIALES,
    );

  const [cargando, setCargando] =
    useState(false);

  const [error, setError] = useState("");

  const [mensaje, setMensaje] =
    useState("");

  if (autenticado && usuario) {
    return (
      <Navigate
        to={
          usuario.rol === "administrador"
            ? "/admin"
            : "/"
        }
        replace
      />
    );
  }

  function actualizarCampo(
    campo: keyof RegistroUsuarioDatos,
    valor: string,
  ): void {
    setFormulario((datosActuales) => ({
      ...datosActuales,
      [campo]: valor,
    }));
  }

  async function manejarEnvio(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setMensaje("");

    if (
      !formulario.nombre.trim() ||
      !formulario.apellido.trim() ||
      !formulario.email.trim() ||
      !formulario.contrasena ||
      !formulario.confirmarContrasena ||
      !formulario.telefono.trim() ||
      !formulario.ubicacion.trim()
    ) {
      setError(
        "Debes completar todos los campos.",
      );

      return;
    }

    if (
      formulario.contrasena !==
      formulario.confirmarContrasena
    ) {
      setError(
        "Las contraseñas no coinciden.",
      );

      return;
    }

    try {
      setCargando(true);

      await registrarUsuario({
        ...formulario,
        nombre: formulario.nombre.trim(),
        apellido:
          formulario.apellido.trim(),
        email:
          formulario.email
            .trim()
            .toLowerCase(),
        telefono:
          formulario.telefono.trim(),
        ubicacion:
          formulario.ubicacion.trim(),
      });

      setMensaje(
        "Cuenta creada correctamente. Ya puedes iniciar sesión.",
      );

      setFormulario(
        DATOS_INICIALES,
      );

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo crear la cuenta",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main
      className="login-page"
      style={estilos.pagina}
    >
      <section
        className="login-card register-card"
        style={estilos.tarjeta}
      >
        <header style={estilos.encabezado}>
          <div
            className="login-logo"
            style={estilos.logo}
          >
            R
          </div>

          <div>
            <span className="login-eyebrow">
              RE-USA MARKETPLACE
            </span>

            <h1 style={estilos.titulo}>
              Crear cuenta
            </h1>

            <p
              className="login-description"
              style={estilos.descripcion}
            >
              Regístrate para comprar y vender
              artículos en el marketplace.
            </p>
          </div>
        </header>

        {error && (
          <div
            className="login-error"
            role="alert"
            style={estilos.mensaje}
          >
            {error}
          </div>
        )}

        {mensaje && (
          <div
            className="login-success"
            role="status"
            style={estilos.mensaje}
          >
            {mensaje}
          </div>
        )}

        <form
          className="login-form register-form"
          style={estilos.formulario}
          onSubmit={manejarEnvio}
        >
          <div
            className="register-form__row"
            style={estilos.fila}
          >
            <label style={estilos.etiqueta}>
              <span>Nombre</span>

              <div
                className="login-input"
                style={estilos.campo}
              >
                <User size={17} />

                <input
                  type="text"
                  value={formulario.nombre}
                  onChange={(event) =>
                    actualizarCampo(
                      "nombre",
                      event.target.value,
                    )
                  }
                  placeholder="Tu nombre"
                  autoComplete="given-name"
                  style={estilos.entrada}
                />
              </div>
            </label>

            <label style={estilos.etiqueta}>
              <span>Apellido</span>

              <div
                className="login-input"
                style={estilos.campo}
              >
                <User size={17} />

                <input
                  type="text"
                  value={formulario.apellido}
                  onChange={(event) =>
                    actualizarCampo(
                      "apellido",
                      event.target.value,
                    )
                  }
                  placeholder="Tu apellido"
                  autoComplete="family-name"
                  style={estilos.entrada}
                />
              </div>
            </label>
          </div>

          <label style={estilos.etiqueta}>
            <span>Correo electrónico</span>

            <div
              className="login-input"
              style={estilos.campo}
            >
              <Mail size={17} />

              <input
                type="email"
                value={formulario.email}
                onChange={(event) =>
                  actualizarCampo(
                    "email",
                    event.target.value,
                  )
                }
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                style={estilos.entrada}
              />
            </div>
          </label>

          <div
            className="register-form__row"
            style={estilos.fila}
          >
            <label style={estilos.etiqueta}>
              <span>Teléfono</span>

              <div
                className="login-input"
                style={estilos.campo}
              >
                <Phone size={17} />

                <input
                  type="tel"
                  value={formulario.telefono}
                  onChange={(event) =>
                    actualizarCampo(
                      "telefono",
                      event.target.value,
                    )
                  }
                  placeholder="809-000-0000"
                  autoComplete="tel"
                  style={estilos.entrada}
                />
              </div>
            </label>

            <label style={estilos.etiqueta}>
              <span>Ubicación</span>

              <div
                className="login-input"
                style={estilos.campo}
              >
                <MapPin size={17} />

                <input
                  type="text"
                  value={formulario.ubicacion}
                  onChange={(event) =>
                    actualizarCampo(
                      "ubicacion",
                      event.target.value,
                    )
                  }
                  placeholder="Santo Domingo"
                  autoComplete="address-level2"
                  style={estilos.entrada}
                />
              </div>
            </label>
          </div>

          <div
            className="register-form__row"
            style={estilos.fila}
          >
            <label style={estilos.etiqueta}>
              <span>Contraseña</span>

              <div
                className="login-input"
                style={estilos.campo}
              >
                <LockKeyhole size={17} />

                <input
                  type="password"
                  value={
                    formulario.contrasena
                  }
                  onChange={(event) =>
                    actualizarCampo(
                      "contrasena",
                      event.target.value,
                    )
                  }
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  style={estilos.entrada}
                />
              </div>
            </label>

            <label style={estilos.etiqueta}>
              <span>Confirmar contraseña</span>

              <div
                className="login-input"
                style={estilos.campo}
              >
                <LockKeyhole size={17} />

                <input
                  type="password"
                  value={
                    formulario
                      .confirmarContrasena
                  }
                  onChange={(event) =>
                    actualizarCampo(
                      "confirmarContrasena",
                      event.target.value,
                    )
                  }
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  style={estilos.entrada}
                />
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={estilos.botonPrincipal}
          >
            <UserPlus size={17} />

            {cargando
              ? "Creando cuenta..."
              : "Crear cuenta"}
          </button>
        </form>

        <div style={estilos.acciones}>
          <button
            className="login-back"
            type="button"
            style={estilos.botonSecundario}
            onClick={() => navigate("/login")}
          >
            Ya tengo una cuenta
          </button>

          <span style={estilos.separador}>
            ·
          </span>

          <button
            className="login-back"
            type="button"
            style={estilos.botonSecundario}
            onClick={() => navigate("/")}
          >
            Volver al Marketplace
          </button>
        </div>
      </section>
    </main>
  );
}

export default Register;