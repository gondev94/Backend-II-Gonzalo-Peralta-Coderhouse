import express from "express";
import usersRouter from "./src/routes/usersRouter.js";
import { engine } from "express-handlebars";
import { mongoConnect } from "./src/database/mongooConect.js";
import { serverRoot } from "./utils.js"
import cookieParser from "cookie-parser";
import session from "express-session";
import viewsRouter from "./src/routes/viewsRouter.js";
import MongoStore from "connect-mongo";
import sessionsRouter from "./src/routes/sessionsRouter.js";
import passport from "passport";
import { initializePassport } from "./src/config/passport.js";

const app = express();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", serverRoot + "/views")
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(serverRoot + "/public"));

app.use(cookieParser("firmadelserlserver"));
app.use(session({
        store: new MongoStore({
            autoRemove: "interval",
            autoRemoveInterval: 1,            
            mongoUrl: "mongodb://localhost:27017/integrative_activity",
            ttl: 10,
        }),
        secret: "secret",
        resave: false,
        saveUninitialized: false,
    })
);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/", viewsRouter);

app.get("/session", async (req, res, next) => {
    res.json(req.session.user);
});

app.post("/session", async (req, res, next) => {
    req.session.user = req.body;
    res.json({ message: "Session set" });
});


const PORT = 7777;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    mongoConnect()
        .then(() => console.log("Connected to MongoDB"))
        .catch((error) => console.log(error));
});
