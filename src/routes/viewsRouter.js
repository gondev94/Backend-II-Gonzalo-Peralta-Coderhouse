import { Router } from "express";
import {
    handleSession,
    avoidLoginView,
} from "../middlewares/sessions.middleware.js";

const router = Router();

router.get("/login", avoidLoginView, async (req, res, next) => {
    try {
        res.render("login.handlebars");
    } catch (error) {
        console.log(error.message);
    }
});

router.get("/profile", handleSession, async (req, res, next) => {
    try {
        const { first_name, last_name, email } = req.session.user;
        res.render("profile.handlebars", {
            first_name,
            last_name,
            email,
        });
    } catch (error) {
        console.log(error.message);
    }
});

export default router;
