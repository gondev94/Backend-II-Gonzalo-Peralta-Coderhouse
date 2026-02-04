import passport from "passport";

// Middleware para autenticar con JWT
export const authenticateJWT = (req, res, next) => {
    passport.authenticate("current", { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ status: "error", message: "Error de autenticación" });
        }
        if (!user) {
            return res.status(401).json({ status: "error", message: "No autorizado" });
        }
        req.user = user;
        next();
    })(req, res, next);
};

// Middleware para verificar rol de admin
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ status: "error", message: "No autorizado" });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({ status: "error", message: "Acceso denegado - Solo administradores" });
    }
    next();
};

// Middleware para verificar que NO es admin (puede comprar)
export const isUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ status: "error", message: "No autorizado" });
    }
    // Admin no puede comprar, solo gestiona productos
    if (req.user.role === "admin") {
        return res.status(403).json({ status: "error", message: "Los administradores no pueden comprar" });
    }
    next();
};

// Middleware para cualquier usuario autenticado
export const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ status: "error", message: "No autorizado" });
    }
    next();
};

// Middleware para verificar que es admin o el mismo usuario
export const isAdminOrSelf = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ status: "error", message: "No autorizado" });
    }
    const userId = req.params.id || req.params.uid;
    if (req.user.role === "admin" || req.user._id.toString() === userId) {
        return next();
    }
    return res.status(403).json({ status: "error", message: "Acceso denegado" });
};
