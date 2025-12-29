import { Router } from "express";
import { UserModel } from "../models/usersModel.js";

const router = Router();

router.post("/register", async (req, res, next) => {
    const user = req.body;
    try {
        const users = await UserModel.create(user);
        res.status(201).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (user) {
            req.session.user = user;
            res.status(200).json({ message: "Login successful" });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
