import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  MapPin,
  Phone,
  Save,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import {
  actualizarUsuarioSesion,
} from "../services/authService";

import {
  actualizarPerfil,
  cambiarContrasena,
  obtenerPerfil,
} from "../services/cuentaService";

import {
  PROVINCIAS_REPUBLICA_DOMINICANA,
} from "../data/provincias";

function Settings() {
  const [nombre, setNombre] =
    useState("");

  const [apellido, setApellido] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [telefono, setTelefono] =
    useState("");

  const [ubicacion, setUbicacion] =
    useState("");

  const [
    mostrarContacto,
    setMostrarContacto,
  ] = useState(false);

  const [
    contrasenaActual,
    setContrasenaActual,
  ] = useState("");

  const [
    nuevaContrasena,
    setNuevaContrasena,
  ] = useState("");

  const [
    confirmarContrasena,
    setConfirmarContrasena,
  ] = useState("");

  const [cargando, setCargando] =
    useState(true);

  const [
    guardandoPerfil,
    setGuardandoPerfil,
  ] = useState(false);

  const [
    guardandoContrasena,
    setGuardandoContrasena,
  ] = useState(false);

  const [errorPerfil, setErrorPerfil] =
    useState("");

  const [
    mensajePerfil,
    setMensajePerfil,
  ] = useState("");

  const [
    errorContrasena,
    setErrorContrasena,
  ] = useState("");

  const [
    mensajeContrasena,
    setMensajeContrasena,
  ] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarPerfil(): Promise<void> {
      try {
        setCargando(true);
        setErrorPerfil("");

        const perfil =
          await obtenerPerfil();

        if (!componenteActivo) {
          return;
        }

        setNombre(perfil.nombre);
        setApellido(perfil.apellido);
        setEmail(perfil.email);
        setTelefono(
          perfil.telefono ?? "",
        );
        setUbicacion(
          perfil.ubicacion ?? "",
        );
        setMostrarContacto(
          Number(
            perfil.mostrar_contacto ?? 0,
          ) === 1,
        );
      } catch (errorDesconocido) {
        const mensaje =
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar el perfil";

        if (componenteActivo) {
          setErrorPerfil(mensaje);
        }
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    void cargarPerfil();

    return () => {
      componenteActivo = false;
    };
  }, []);

  async function manejarActualizacionPerfil(
    evento: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    evento.preventDefault();

    const ubicacionValida =
      PROVINCIAS_REPUBLICA_DOMINICANA.some(
        (provincia) => provincia === ubicacion,
      );

    if (!ubicacionValida) {
      setErrorPerfil(
        "Debes seleccionar una provincia válida.",
      );
      setMensajePerfil("");

      return;
    }

    try {
      setGuardandoPerfil(true);
      setErrorPerfil("");
      setMensajePerfil("");

      const perfil =
        await actualizarPerfil({
          nombre,
          apellido,
          telefono,
          ubicacion,
          mostrarContacto,
        });

      actualizarUsuarioSesion({
        nombre: perfil.nombre,
        apellido: perfil.apellido,
      });

      setNombre(perfil.nombre);
      setApellido(perfil.apellido);
      setTelefono(
        perfil.telefono ?? "",
      );
      setUbicacion(
        perfil.ubicacion ?? "",
      );
      setMostrarContacto(
        Number(
          perfil.mostrar_contacto ?? 0,
        ) === 1,
      );

      setMensajePerfil(
        "Perfil actualizado correctamente",
      );
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo actualizar el perfil";

      setErrorPerfil(mensaje);
    } finally {
      setGuardandoPerfil(false);
    }
  }

  async function manejarCambioContrasena(
    evento: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    evento.preventDefault();

    try {
      setGuardandoContrasena(true);
      setErrorContrasena("");
      setMensajeContrasena("");

      await cambiarContrasena({
        contrasenaActual,
        nuevaContrasena,
        confirmarContrasena,
      });

      setContrasenaActual("");
      setNuevaContrasena("");
      setConfirmarContrasena("");

      setMensajeContrasena(
        "Contraseña actualizada correctamente",
      );
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo actualizar la contraseña";

      setErrorContrasena(mensaje);
    } finally {
      setGuardandoContrasena(false);
    }
  }

  if (cargando) {
    return (
      <p className="status-message">
        Cargando configuración...
      </p>
    );
  }

  return (
    <section className="settings-page">
      <header className="settings-page__header">
        <span>Mi cuenta</span>

        <h1>Configuración</h1>

        <p>
          Actualiza tus datos personales y
          la seguridad de tu cuenta.
        </p>
      </header>

      <div className="settings-page__layout">
        <form
          className="settings-card"
          onSubmit={(evento) =>
            void manejarActualizacionPerfil(
              evento,
            )
          }
        >
          <header className="settings-card__header">
            <span>
              <UserRound size={20} />
            </span>

            <div>
              <h2>Información personal</h2>

              <p>
                Controla los datos de tu
                perfil y publicaciones.
              </p>
            </div>
          </header>

          {errorPerfil && (
            <div
              className="error-message"
              role="alert"
            >
              {errorPerfil}
            </div>
          )}

          {mensajePerfil && (
            <div
              className="success-message"
              role="status"
            >
              <CheckCircle2 size={18} />
              {mensajePerfil}
            </div>
          )}

          <div className="settings-form-grid">
            <label>
              Nombre

              <input
                type="text"
                value={nombre}
                maxLength={100}
                required
                onChange={(evento) =>
                  setNombre(
                    evento.target.value,
                  )
                }
              />
            </label>

            <label>
              Apellido

              <input
                type="text"
                value={apellido}
                maxLength={100}
                required
                onChange={(evento) =>
                  setApellido(
                    evento.target.value,
                  )
                }
              />
            </label>

            <label className="settings-form-grid__full">
              Correo electrónico

              <input
                type="email"
                value={email}
                disabled
              />

              <small>
                El correo no puede
                modificarse desde esta
                pantalla.
              </small>
            </label>

            <label>
              <span>
                <Phone size={15} />
                Teléfono
              </span>

              <input
                type="tel"
                value={telefono}
                maxLength={30}
                placeholder="809-000-0000"
                onChange={(evento) =>
                  setTelefono(
                    evento.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>
                <MapPin size={15} />
                Provincia
              </span>

              <select
                value={ubicacion}
                required
                onChange={(evento) =>
                  setUbicacion(
                    evento.target.value,
                  )
                }
              >
                <option value="">
                  Selecciona tu provincia
                </option>

                {PROVINCIAS_REPUBLICA_DOMINICANA.map(
                  (provincia) => (
                    <option
                      key={provincia}
                      value={provincia}
                    >
                      {provincia}
                    </option>
                  ),
                )}
              </select>
            </label>

            <div className="settings-privacy settings-form-grid__full">
              <div className="settings-privacy__icon">
                {mostrarContacto ? (
                  <Eye size={20} />
                ) : (
                  <EyeOff size={20} />
                )}
              </div>

              <div className="settings-privacy__content">
                <strong>
                  Mostrar mi información de contacto
                </strong>

                <p>
                  Permite que otros usuarios
                  vean tu correo y teléfono
                  en tus publicaciones.
                </p>
              </div>

              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={mostrarContacto}
                  onChange={(evento) =>
                    setMostrarContacto(
                      evento.target.checked,
                    )
                  }
                />

                <span aria-hidden="true" />
              </label>
            </div>
          </div>

          <button
            className="settings-submit"
            type="submit"
            disabled={guardandoPerfil}
          >
            <Save size={17} />

            {guardandoPerfil
              ? "Guardando..."
              : "Guardar cambios"}
          </button>
        </form>

        <form
          className="settings-card"
          onSubmit={(evento) =>
            void manejarCambioContrasena(
              evento,
            )
          }
        >
          <header className="settings-card__header">
            <span>
              <KeyRound size={20} />
            </span>

            <div>
              <h2>Seguridad</h2>

              <p>
                Cambia la contraseña de tu
                cuenta.
              </p>
            </div>
          </header>

          {errorContrasena && (
            <div
              className="error-message"
              role="alert"
            >
              {errorContrasena}
            </div>
          )}

          {mensajeContrasena && (
            <div
              className="success-message"
              role="status"
            >
              <CheckCircle2 size={18} />
              {mensajeContrasena}
            </div>
          )}

          <div className="settings-password-fields">
            <label>
              Contraseña actual

              <input
                type="password"
                value={contrasenaActual}
                autoComplete="current-password"
                required
                onChange={(evento) =>
                  setContrasenaActual(
                    evento.target.value,
                  )
                }
              />
            </label>

            <label>
              Nueva contraseña

              <input
                type="password"
                value={nuevaContrasena}
                minLength={8}
                autoComplete="new-password"
                required
                onChange={(evento) =>
                  setNuevaContrasena(
                    evento.target.value,
                  )
                }
              />

              <small>
                Debe tener al menos 8
                caracteres.
              </small>
            </label>

            <label>
              Confirmar nueva contraseña

              <input
                type="password"
                value={
                  confirmarContrasena
                }
                minLength={8}
                autoComplete="new-password"
                required
                onChange={(evento) =>
                  setConfirmarContrasena(
                    evento.target.value,
                  )
                }
              />
            </label>
          </div>

          <button
            className="settings-submit"
            type="submit"
            disabled={
              guardandoContrasena
            }
          >
            <KeyRound size={17} />

            {guardandoContrasena
              ? "Actualizando..."
              : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Settings;