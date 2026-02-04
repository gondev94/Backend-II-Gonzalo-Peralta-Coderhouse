import "dotenv/config";
import express from "express";
import { engine } from "express-handlebars";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";

import { mongoConnect } from "./src/database/mongooConect.js";
import { initializePassport } from "./src/config/passport.js";
import { serverRoot } from "./utils.js";

// Rutas
import usersRouter from "./src/routes/usersRouter.js";
import sessionsRouter from "./src/routes/sessionsRouter.js";
import productsRouter from "./src/routes/productsRouter.js";
import cartsRouter from "./src/routes/cartsRouter.js";
import viewsRouter from "./src/routes/viewsRouter.js";

const app = express();

// Variables de entorno
const PORT = process.env.PORT || 7777;
const MONGO_URL = process.env.MONGODB_URI || "mongodb://localhost:27017/integrative_activity";
const SESSION_SECRET = process.env.SESSION_SECRET || "secret";
const COOKIE_SECRET = process.env.COOKIE_SECRET || "firmadelserlserver";

// Configuración de Handlebars con helpers
app.engine("handlebars", engine({
    helpers: {
        eq: (a, b) => a === b,
        multiply: (a, b) => a * b,
        lt: (a, b) => a < b,
        gt: (a, b) => a > b,
        and: (a, b) => a && b,
        or: (a, b) => a || b,
    }
}));
app.set("view engine", "handlebars");
app.set("views", serverRoot + "/src/views");

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(serverRoot + "/public"));
app.use(cookieParser(COOKIE_SECRET));

// Sesiones
app.use(
    session({
        store: new MongoStore({
            mongoUrl: MONGO_URL,
            ttl: 3600,
        }),
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// Passport
initializePassport();
app.use(passport.initialize());

// Rutas API
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Rutas de vistas
app.use("/", viewsRouter);

// Error 404
app.use((req, res) => {
    res.status(404).json({ status: "error", message: "Ruta no encontrada" });
});

// Iniciar servidor
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    
    try {
        await mongoConnect();
        console.log("Conectado a MongoDB");
    } catch (error) {
        console.error("Error conectando a MongoDB:", error);
    }
});
