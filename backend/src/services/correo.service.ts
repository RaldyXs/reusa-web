import nodemailer from "nodemailer";

interface DatosCorreoRecuperacion {
  destinatario: string;
  nombreUsuario: string;
  enlaceRecuperacion: string;
}

function obtenerConfiguracionCorreo() {
  const host = process.env.SMTP_HOST;
  const puerto = Number(
    process.env.SMTP_PORT ?? 587,
  );
  const usuario = process.env.SMTP_USER;
  const contrasena = process.env.SMTP_PASSWORD;
  const remitente =
    process.env.SMTP_FROM ?? usuario;

  if (
    !host ||
    !Number.isInteger(puerto) ||
    !usuario ||
    !contrasena ||
    !remitente
  ) {
    throw new Error(
      "La configuración SMTP no está completa",
    );
  }

  return {
    host,
    puerto,
    usuario,
    contrasena,
    remitente,
  };
}

export async function enviarCorreoRecuperacion({
  destinatario,
  nombreUsuario,
  enlaceRecuperacion,
}: DatosCorreoRecuperacion): Promise<void> {
  const configuracion =
    obtenerConfiguracionCorreo();

  const transportador =
    nodemailer.createTransport({
      host: configuracion.host,
      port: configuracion.puerto,
      secure:
        configuracion.puerto === 465,

      auth: {
        user: configuracion.usuario,
        pass: configuracion.contrasena,
      },
    });

  await transportador.sendMail({
    from: configuracion.remitente,
    to: destinatario,
    subject:
      "Recuperación de contraseña - Re-Usa",

    text: [
      `Hola ${nombreUsuario},`,
      "",
      "Recibimos una solicitud para restablecer tu contraseña.",
      "",
      `Abre este enlace: ${enlaceRecuperacion}`,
      "",
      "El enlace vence en una hora.",
      "",
      "Si no solicitaste este cambio, puedes ignorar este mensaje.",
    ].join("\n"),

    html: `
      <div
        style="
          max-width: 560px;
          margin: 0 auto;
          padding: 32px;
          font-family: Arial, sans-serif;
          color: #1f2937;
        "
      >
        <div
          style="
            width: 52px;
            height: 52px;
            margin-bottom: 24px;
            border-radius: 14px;
            background: #2563eb;
            color: white;
            font-size: 26px;
            font-weight: 700;
            line-height: 52px;
            text-align: center;
          "
        >
          R
        </div>

        <h1
          style="
            margin: 0 0 16px;
            font-size: 24px;
          "
        >
          Recuperar contraseña
        </h1>

        <p>
          Hola ${nombreUsuario},
        </p>

        <p>
          Recibimos una solicitud para
          restablecer la contraseña de tu
          cuenta en Re-Usa.
        </p>

        <p style="margin: 28px 0;">
          <a
            href="${enlaceRecuperacion}"
            style="
              display: inline-block;
              padding: 12px 20px;
              border-radius: 8px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              font-weight: 700;
            "
          >
            Crear nueva contraseña
          </a>
        </p>

        <p>
          Este enlace vencerá en una hora
          y solo podrá utilizarse una vez.
        </p>

        <p
          style="
            margin-top: 28px;
            color: #6b7280;
            font-size: 14px;
          "
        >
          Si no solicitaste este cambio,
          puedes ignorar este mensaje.
        </p>
      </div>
    `,
  });
}