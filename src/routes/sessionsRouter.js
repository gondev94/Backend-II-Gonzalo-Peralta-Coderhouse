import { Router } from "express";
import passport from "passport";
import { register, login, current, logout } from "../controllers/sessions.controller.js";
import { forgotPassword, verifyResetToken, resetPassword } from "../controllers/password.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { generateToken } from "../config/passport.js";

const router = Router();

// POST /api/sessions/register
router.post(
    "/register",
    passport.authenticate("register", { session: false, failureMessage: true }),
    register
);

// POST /api/sessions/login
router.post(
    "/login",
    passport.authenticate("login", { session: false, failureMessage: true }),
    login
);

// GET /api/sessions/current - Requiere autenticación
router.get("/current", authenticateJWT, current);

// POST /api/sessions/logout
router.post("/logout", logout);

// Recuperación de contraseña
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", verifyResetToken);
router.post("/reset-password/:token", resetPassword);

// ============================================
// GOOGLE OAUTH
// ============================================

// Verificar si Google OAuth está configurado
const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// GET /api/sessions/google - Iniciar login con Google
router.get("/google", (req, res, next) => {
    if (!isGoogleConfigured) {
        return res.redirect("/login?error=google_not_configured");
    }
    passport.authenticate("google", { 
        scope: ["profile", "email"] 
    })(req, res, next);
});

// GET /api/sessions/google/callback - Callback de Google
router.get("/google/callback", (req, res, next) => {
    if (!isGoogleConfigured) {
        return res.redirect("/login?error=google_not_configured");
    }
    
    passport.authenticate("google", { 
        session: false, 
        failureRedirect: "/login?error=google" 
    }, async (err, user) => {
        if (err || !user) {
            return res.redirect("/login?error=google");
        }
        
        try {
            // Generar JWT token
            const token = generateToken(user);
            res.cookie("jwt-cookie", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
            });

            // Guardar en sesión
            req.session.user = {
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                cart: user.cart,
            };

            // Redirigir a productos
            res.redirect("/products");
        } catch (error) {
            console.error("Error en Google callback:", error);
            res.redirect("/login?error=google");
        }
    })(req, res, next);
});

export default router;
