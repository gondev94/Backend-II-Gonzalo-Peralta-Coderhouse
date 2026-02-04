import { Router } from "express";
import { 
    loginView, 
    registerView, 
    profileView, 
    productsView, 
    cartView,
    adminProductsView 
} from "../controllers/views.controller.js";

const router = Router();

// Middleware para verificar sesión en vistas
const requireSession = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    return res.redirect("/login");
};

// Middleware para evitar login si ya hay sesión
const avoidLoginView = (req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    return res.redirect("/profile");
};

// Middleware para verificar admin en vistas
const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") {
        return next();
    }
    return res.redirect("/products");
};

// Rutas públicas
router.get("/login", avoidLoginView, loginView);
router.get("/register", avoidLoginView, registerView);

// Rutas de recuperación de contraseña
router.get("/forgot-password", avoidLoginView, (req, res) => {
    res.render("forgot-password");
});

router.get("/reset-password/:token", (req, res) => {
    res.render("reset-password", { token: req.params.token });
});

// Rutas que requieren sesión
router.get("/profile", requireSession, profileView);
router.get("/products", productsView);
router.get("/cart", requireSession, cartView);

// Rutas de admin
router.get("/admin/products", requireSession, requireAdmin, adminProductsView);

// Ruta raíz
router.get("/", (req, res) => {
    if (req.session.user) {
        res.redirect("/products");
    } else {
        res.redirect("/login");
    }
});

export default router;
