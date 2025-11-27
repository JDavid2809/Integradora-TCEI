


import nodemailer from "nodemailer";


export async function sendVerificationEmail(to: string, token: string, name: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const verificationLink = `${process.env.NEXT_PUBLIC_URL}/confirmation?token=${token}`;

  await transporter.sendMail({
    from: `"English App" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify your email - English App",
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; background-color:#f4f5f7; padding:40px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background:#ffffff; padding:25px; border-bottom:1px solid #eee; text-align:center;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/British_flag_icon_round.svg" alt="English App" style="height:50px;" />
            <h1 style="color:#333; margin:15px 0 0; font-size:22px;">English App</h1>
          </div>

          <!-- Body -->
          <div style="padding:40px 30px; text-align:center;">
            <div style="font-size:50px; margin-bottom:20px;"></div>
            <h2 style="color:#222; margin-bottom:15px;">Verify your email address</h2>
            <p style="font-size:15px; color:#555; margin-bottom:25px; line-height:1.6;">
              Hello <strong>${name}</strong>,<br>
              Thanks for joining <strong>English App</strong>.  
              Please confirm your email address to activate your account.
            </p>

            <a href="${verificationLink}" 
              style="display:inline-block; padding:14px 30px; background:#2d6cdf; color:#fff; text-decoration:none; font-size:16px; font-weight:bold; border-radius:6px;">
              Verify Account
            </a>

            <p style="font-size:13px; color:#777; margin-top:25px;">
              This link will expire in <strong>24 hours</strong>.
            </p>
          </div>

          <!-- Divider -->
          <div style="border-top:1px solid #eee; margin:0 30px;"></div>

          <!-- Footer -->
          <div style="padding:20px 30px; text-align:center; font-size:12px; color:#999;">
            <p style="margin:0;">© ${new Date().getFullYear()} English App. All rights reserved.</p>
            <p style="margin:5px 0 0;">
              <a href="${process.env.NEXT_PUBLIC_URL}/privacy" style="color:#2d6cdf; text-decoration:none;">Privacy Policy</a> · 
              <a href="${process.env.NEXT_PUBLIC_URL}/support" style="color:#2d6cdf; text-decoration:none;">Support</a>
            </p>
          </div>

        </div>
      </div>
    `,
  });
}




export async function ResetEmail(to: string, name: string, url: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"EnglishApp" <no-reply@englishapp.com>',
    to,
    subject: `Restablece tu contraseña, ${name}`,
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px; color: #333;">
      <table width="100%" style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.06); overflow: hidden;">
        <tr>
          <td style="background: #111827; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 20px; margin: 0;">EnglishApp</h1>
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">Aprende inglés fácil y profesionalmente</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px;">
            <h2 style="color: #111827; font-size: 22px; margin-bottom: 10px;">Hola ${name}</h2>
            <p style="font-size: 15px; color: #374151; line-height: 1.6;">
              Recibimos una solicitud para <strong>restablecer tu contraseña</strong>.  
              Si no realizaste esta acción, puedes ignorar este correo.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" target="_blank" 
                style="display: inline-block; background: #2563eb; color: #fff; padding: 14px 28px; 
                text-decoration: none; font-size: 16px; border-radius: 8px; font-weight: bold; 
                box-shadow: 0 4px 8px rgba(37,99,235,0.2);">
                Cambiar Contraseña
              </a>
            </div>
            <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">
              Este enlace expirará en <strong>1 hora</strong> por motivos de seguridad.  
              Haz clic en el botón para continuar con el proceso.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">EnglishApp © 2025</p>
            <p style="margin: 4px 0;">Mejora tu inglés, mejora tu futuro</p>
          </td>
        </tr>
      </table>
    </div>
    `,
  });
}

export async function sendTeacherCredentials(to: string, name: string, lastname: string, email: string, password: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const loginUrl = `${process.env.NEXT_PUBLIC_URL}/login`;

  await transporter.sendMail({
    from: `"English App" <${process.env.SMTP_USER}>`,
    to,
    subject: "¡Bienvenido al equipo de profesores! - English App",
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; background-color:#f4f5f7; padding:40px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background:#00246a; padding:25px; text-align:center;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/British_flag_icon_round.svg" alt="English App" style="height:50px;" />
            <h1 style="color:#ffffff; margin:15px 0 0; font-size:22px;">English App</h1>
            <p style="color:#ffffff; margin:5px 0 0; font-size:14px;">Portal de Profesores</p>
          </div>

          <!-- Body -->
          <div style="padding:40px 30px;">
            <div style="text-align:center; font-size:50px; margin-bottom:20px;"></div>
            <h2 style="color:#00246a; margin-bottom:15px; text-align:center;">¡Tu solicitud ha sido aprobada!</h2>
            
            <p style="font-size:16px; color:#333; margin-bottom:25px; line-height:1.6;">
              Estimado/a <strong>${name} ${lastname}</strong>,
            </p>
            
            <p style="font-size:15px; color:#555; margin-bottom:25px; line-height:1.6;">
              ¡Felicidades! Tu solicitud para unirte como profesor a <strong>English App</strong> ha sido aprobada por nuestro equipo administrativo.
            </p>

            <!-- Credentials Box -->
            <div style="background:#f8f9fa; border:2px solid #00246a; border-radius:8px; padding:25px; margin:25px 0;">
              <h3 style="color:#00246a; margin:0 0 15px; font-size:18px; text-align:center;">Tus Credenciales de Acceso</h3>
              
              <div style="background:#ffffff; border-radius:6px; padding:15px; margin:10px 0;">
                <p style="margin:0; font-size:14px; color:#666;"><strong>Correo electrónico:</strong></p>
                <p style="margin:5px 0 0; font-size:16px; color:#00246a; font-weight:bold;">${email}</p>
              </div>
              
              <div style="background:#ffffff; border-radius:6px; padding:15px; margin:10px 0;">
                <p style="margin:0; font-size:14px; color:#666;"><strong>Contraseña temporal:</strong></p>
                <p style="margin:5px 0 0; font-size:16px; color:#00246a; font-weight:bold; font-family:monospace;">${password}</p>
              </div>
            </div>

            <div style="text-align:center; margin:30px 0;">
                <a href="${loginUrl}" 
                style="display:inline-block; padding:16px 32px; background:#00246a; color:#fff; text-decoration:none; font-size:16px; font-weight:bold; border-radius:8px; box-shadow:0 4px 8px rgba(0,36,106,0.2);">
                Acceder al Portal
              </a>
            </div>

            <!-- Important Notice -->
            <div style="background:#fff3cd; border:1px solid #ffeaa7; border-radius:6px; padding:20px; margin:25px 0;">
              <h4 style="color:#856404; margin:0 0 10px; font-size:16px;">Importante - Primer Acceso:</h4>
              <ul style="color:#856404; margin:0; padding-left:20px; font-size:14px;">
                <li>Esta es una <strong>contraseña temporal</strong> por motivos de seguridad</li>
                <li><strong>Deberás cambiarla</strong> en tu primer inicio de sesión</li>
                <li>El sistema te pedirá crear una nueva contraseña personal</li>
                <li>Guarda estas credenciales hasta que puedas cambiar la contraseña</li>
              </ul>
            </div>

            <p style="font-size:15px; color:#555; margin-top:30px; line-height:1.6; text-align:center;">
              ¡Estamos emocionados de tenerte en nuestro equipo de profesores!<br>
              Juntos haremos que el aprendizaje del inglés sea extraordinario.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding:20px 30px; text-align:center; font-size:12px; color:#999; border-top:1px solid #eee;">
            <p style="margin:0;">© ${new Date().getFullYear()} English App. Todos los derechos reservados.</p>
            <p style="margin:5px 0 0;">
              <a href="${process.env.NEXT_PUBLIC_URL}/support" style="color:#00246a; text-decoration:none;">Soporte Técnico</a> · 
              <a href="${process.env.NEXT_PUBLIC_URL}/teacher-guide" style="color:#00246a; text-decoration:none;">Guía del Profesor</a>
            </p>
          </div>

        </div>
      </div>
    `,
  });
}
