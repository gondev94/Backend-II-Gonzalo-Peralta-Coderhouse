import nodemailer from "nodemailer";

let transporter = null;

// Variables de entorno
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const BASE_URL = process.env.BASE_URL || "http://localhost:7777";

/**
 * Crear transporter de email
 * Si hay credenciales de Gmail configuradas, las usa.
 * Si no, crea una cuenta de prueba en Ethereal.
 */
const createTransporter = async () => {
    if (transporter) return transporter;

    // Si hay credenciales de Gmail configuradas
    if (EMAIL_USER && EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
        });
        console.log(" Email configurado con Gmail:", EMAIL_USER);
        return transporter;
    }

    // Si no hay credenciales, usar Ethereal (servicio de prueba)
    const testAccount = await nodemailer.createTestAccount();
    
    console.log("═══════════════════════════════════════════════════");
    console.log(" USANDO EMAIL DE PRUEBA (Ethereal):");
    console.log(`   Usuario: ${testAccount.user}`);
    console.log(`   Password: ${testAccount.pass}`);
    console.log("     Configura EMAIL_USER y EMAIL_PASS en .env para usar Gmail");
    console.log("═══════════════════════════════════════════════════");

    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    return transporter;
};

/**
 * Enviar email de recuperación de contraseña
 */
export const sendPasswordResetEmail = async (to, resetToken, userName) => {
    const emailTransporter = await createTransporter();
    const resetUrl = `${BASE_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
        from: EMAIL_USER ? `"Ecommerce" <${EMAIL_USER}>` : '"Ecommerce" <noreply@ecommerce.com>',
        to: to,
        subject: "Recuperación de Contraseña - Ecommerce",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h1 { color: #333; text-align: center; }
                    p { color: #666; line-height: 1.6; }
                    .btn { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
                    .warning { background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Recuperar Contraseña</h1>
                    <p>Hola <strong>${userName}</strong>,</p>
                    <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="btn">Restablecer Contraseña</a>
                    </div>
                    
                    <div class="warning">
                        Este enlace expira en <strong>1 hora</strong>.
                    </div>
                    
                    <p>Si no solicitaste esto, ignora este email.</p>
                    
                    <p>Si el botón no funciona, copia este enlace:</p>
                    <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                    
                    <div class="footer">
                        © 2024 Ecommerce - Todos los derechos reservados
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await emailTransporter.sendMail(mailOptions);
        
        // Si es Ethereal, mostrar URL de preview
        if (!EMAIL_USER) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log("═══════════════════════════════════════════════════");
            console.log(" EMAIL ENVIADO (Ethereal - Prueba)");
            console.log(`   Para: ${to}`);
            console.log("");
            console.log(" VER EMAIL ENVIADO:");
            console.log(`   ${previewUrl}`);
            console.log("═══════════════════════════════════════════════════");
            
            return { 
                success: true, 
                messageId: info.messageId,
                previewUrl: previewUrl 
            };
        }
        
        console.log(" Email enviado a:", to);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error(" Error enviando email:", error);
        throw error;
    }
};
