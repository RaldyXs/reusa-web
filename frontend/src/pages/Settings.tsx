import {
  Bell,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";

interface DatosPerfil {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  ubicacion: string;
}

interface DatosContrasena {
  actual: string;
  nueva: string;
  confirmar: string;
}

const CLAVE_CONFIGURACION = "reusa-configuracion-usuario";

function obtenerConfiguracionInicial(): DatosPerfil {
  const datosPredeterminados: DatosPerfil = {
    nombre: "Usuario",
    apellido: "Re-Usa",
    correo: "usuario@reusa.com",
    telefono: "809-555-0100",
    ubicacion: "Santo Domingo",
  };

  try {
    const valorGuardado = localStorage.getItem(
      CLAVE_CONFIGURACION,
    );

    if (!valorGuardado) {
      return datosPredeterminados;
    }

    return {
      ...datosPredeterminados,
      ...(JSON.parse(valorGuardado) as Partial<DatosPerfil>),
    };
  } catch {
    return datosPredeterminados;
  }
}

function Settings() {
  const [perfil, setPerfil] = useState<DatosPerfil>(
    obtenerConfiguracionInicial,
  );

  const [contrasenas, setContrasenas] =
    useState<DatosContrasena>({
      actual: "",
      nueva: "",
      confirmar: "",
    });

  const [mostrarContrasenas, setMostrarContrasenas] =
    useState(false);

  const [notificaciones, setNotificaciones] = useState({
    mensajes: true,
    ofertas: true,
    novedades: false,
  });

  const [mensajePerfil, setMensajePerfil] = useState("");
  const [mensajeContrasena, setMensajeContrasena] =
    useState("");

  function manejarCambioPerfil(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = event.target;

    setPerfil((datosActuales) => ({
      ...datosActuales,
      [name]: value,
    }));
  }

  function guardarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    localStorage.setItem(
      CLAVE_CONFIGURACION,
      JSON.stringify(perfil),
    );

    setMensajePerfil("Los datos del perfil fueron guardados.");
  }

  function manejarCambioContrasena(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = event.target;

    setContrasenas((datosActuales) => ({
      ...datosActuales,
      [name]: value,
    }));
  }

  function guardarContrasena(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMensajeContrasena("");

    if (
      !contrasenas.actual ||
      !contrasenas.nueva ||
      !contrasenas.confirmar
    ) {
      setMensajeContrasena(
        "Completa todos los campos de contraseña.",
      );
      return;
    }

    if (contrasenas.nueva.length < 6) {
      setMensajeContrasena(
        "La nueva contraseña debe tener al menos 6 caracteres.",
      );
      return;
    }

    if (
      contrasenas.nueva !== contrasenas.confirmar
    ) {
      setMensajeContrasena(
        "Las nuevas contraseñas no coinciden.",
      );
      return;
    }

    setContrasenas({
      actual: "",
      nueva: "",
      confirmar: "",
    });

    setMensajeContrasena(
      "Contraseña actualizada correctamente.",
    );
  }

  return (
    <section className="settings-page">
      <header className="settings-page__header">
        <span>Mi cuenta</span>
        <h1>Configuración</h1>
        <p>
          Administra tu información personal, seguridad y
          notificaciones.
        </p>
      </header>

      <div className="settings-layout">
        <div className="settings-main">
          <form
            className="settings-card"
            onSubmit={guardarPerfil}
          >
            <div className="settings-card__header">
              <span className="settings-card__icon">
                <UserRound size={20} />
              </span>

              <div>
                <h2>Información personal</h2>
                <p>
                  Datos visibles en tu cuenta de Re-Usa.
                </p>
              </div>
            </div>

            <div className="settings-form-grid">
              <label>
                Nombre
                <input
                  name="nombre"
                  type="text"
                  value={perfil.nombre}
                  onChange={manejarCambioPerfil}
                  required
                />
              </label>

              <label>
                Apellido
                <input
                  name="apellido"
                  type="text"
                  value={perfil.apellido}
                  onChange={manejarCambioPerfil}
                  required
                />
              </label>

              <label>
                <span>
                  <Mail size={14} />
                  Correo electrónico
                </span>

                <input
                  name="correo"
                  type="email"
                  value={perfil.correo}
                  onChange={manejarCambioPerfil}
                  required
                />
              </label>

              <label>
                Teléfono
                <input
                  name="telefono"
                  type="tel"
                  value={perfil.telefono}
                  onChange={manejarCambioPerfil}
                />
              </label>

              <label className="settings-form-grid__full">
                <span>
                  <MapPin size={14} />
                  Ubicación
                </span>

                <input
                  name="ubicacion"
                  type="text"
                  value={perfil.ubicacion}
                  onChange={manejarCambioPerfil}
                />
              </label>
            </div>

            {mensajePerfil && (
              <p className="settings-message">
                {mensajePerfil}
              </p>
            )}

            <div className="settings-card__actions">
              <button type="submit">
                <Save size={17} />
                Guardar cambios
              </button>
            </div>
          </form>

          <form
            className="settings-card"
            onSubmit={guardarContrasena}
          >
            <div className="settings-card__header">
              <span className="settings-card__icon">
                <LockKeyhole size={20} />
              </span>

              <div>
                <h2>Seguridad</h2>
                <p>
                  Actualiza la contraseña de acceso.
                </p>
              </div>
            </div>

            <div className="settings-password-grid">
              <label>
                Contraseña actual

                <div className="settings-password-input">
                  <input
                    name="actual"
                    type={
                      mostrarContrasenas
                        ? "text"
                        : "password"
                    }
                    value={contrasenas.actual}
                    onChange={manejarCambioContrasena}
                  />

                  <button
                    type="button"
                    aria-label={
                      mostrarContrasenas
                        ? "Ocultar contraseñas"
                        : "Mostrar contraseñas"
                    }
                    onClick={() =>
                      setMostrarContrasenas(
                        (valorActual) => !valorActual,
                      )
                    }
                  >
                    {mostrarContrasenas ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </label>

              <label>
                Nueva contraseña
                <input
                  name="nueva"
                  type={
                    mostrarContrasenas
                      ? "text"
                      : "password"
                  }
                  value={contrasenas.nueva}
                  onChange={manejarCambioContrasena}
                />
              </label>

              <label>
                Confirmar contraseña
                <input
                  name="confirmar"
                  type={
                    mostrarContrasenas
                      ? "text"
                      : "password"
                  }
                  value={contrasenas.confirmar}
                  onChange={manejarCambioContrasena}
                />
              </label>
            </div>

            {mensajeContrasena && (
              <p className="settings-message">
                {mensajeContrasena}
              </p>
            )}

            <div className="settings-card__actions">
              <button type="submit">
                <ShieldCheck size={17} />
                Actualizar contraseña
              </button>
            </div>
          </form>
        </div>

        <aside className="settings-card settings-notifications">
          <div className="settings-card__header">
            <span className="settings-card__icon">
              <Bell size={20} />
            </span>

            <div>
              <h2>Notificaciones</h2>
              <p>
                Elige qué avisos deseas recibir.
              </p>
            </div>
          </div>

          <label className="settings-switch">
            <div>
              <strong>Nuevos mensajes</strong>
              <span>
                Avisos cuando un usuario te escriba.
              </span>
            </div>

            <input
              type="checkbox"
              checked={notificaciones.mensajes}
              onChange={(event) =>
                setNotificaciones((actuales) => ({
                  ...actuales,
                  mensajes: event.target.checked,
                }))
              }
            />

            <span aria-hidden="true" />
          </label>

          <label className="settings-switch">
            <div>
              <strong>Ofertas recibidas</strong>
              <span>
                Avisos de nuevas ofertas en tus artículos.
              </span>
            </div>

            <input
              type="checkbox"
              checked={notificaciones.ofertas}
              onChange={(event) =>
                setNotificaciones((actuales) => ({
                  ...actuales,
                  ofertas: event.target.checked,
                }))
              }
            />

            <span aria-hidden="true" />
          </label>

          <label className="settings-switch">
            <div>
              <strong>Novedades de Re-Usa</strong>
              <span>
                Recomendaciones y noticias del marketplace.
              </span>
            </div>

            <input
              type="checkbox"
              checked={notificaciones.novedades}
              onChange={(event) =>
                setNotificaciones((actuales) => ({
                  ...actuales,
                  novedades: event.target.checked,
                }))
              }
            />

            <span aria-hidden="true" />
          </label>
        </aside>
      </div>
    </section>
  );
}

export default Settings;