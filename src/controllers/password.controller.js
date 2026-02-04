import crypto from "crypto";
import { UserModel } from "../models/usersModel.js";
import { sendPasswordResetEmail } from "../services/email.service.js";
import { createHash, isValidPassword } from "../../utils.js";

// POST /api/sessions/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                status: "error", 
                message: "El email es requerido" 
            });
        }

        const user = await UserModel.findOne({ email: email.toLowerCase() });

        // Por seguridad, siempre respondemos lo mismo
        if (!user) {
            return res.status(200).json({ 
                status: "success", 
                message: "Si el email existe, recibirás un enlace de recuperación" 
            });
        }

        // Generar token único
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

        // Guardar token hasheado y fecha de expiración (1 hora)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();

        // Enviar email
        try {
            await sendPasswordResetEmail(user.email, resetToken, user.first_name);
            
            res.status(200).json({ 
                status: "success", 
                message: "Si el email existe, recibirás un enlace de recuperación" 
            });
        } catch (emailError) {
            // Si falla el email, limpiar el token
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            
            console.error("Error enviando email:", emailError);
            res.status(500).json({ 
                status: "error", 
                message: "Error al enviar el email. Intenta más tarde." 
            });
        }
    } catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

// GET /api/sessions/reset-password/:token - Verificar token
export const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        // Hashear el token para comparar
        const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const user = await UserModel.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                status: "error", 
                message: "Token inválido o expirado" 
            });
        }

        res.status(200).json({ 
            status: "success", 
            message: "Token válido",
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// POST /api/sessions/reset-password/:token - Cambiar contraseña
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        // Validaciones
        if (!password || !confirmPassword) {
            return res.status(400).json({ 
                status: "error", 
                message: "Ambas contraseñas son requeridas" 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                status: "error", 
                message: "Las contraseñas no coinciden" 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                status: "error", 
                message: "La contraseña debe tener al menos 6 caracteres" 
            });
        }

        // Buscar usuario con token válido
        const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const user = await UserModel.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                status: "error", 
                message: "Token inválido o expirado" 
            });
        }

        // Verificar que no sea la misma contraseña
        if (isValidPassword(password, user.password)) {
            return res.status(400).json({ 
                status: "error", 
                message: "La nueva contraseña debe ser diferente a la anterior" 
            });
        }

        // Actualizar contraseña y limpiar token
        user.password = createHash(password);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ 
            status: "success", 
            message: "Contraseña actualizada exitosamente" 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};
