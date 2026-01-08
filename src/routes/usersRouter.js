import { Router } from "express";
import { UserModel } from "../models/usersModel.js";
import { createHash } from "../../utils.js";

const router = Router();

router.get("/", async (req, res, next) => {
    try {
        const users = await UserModel.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/register", async (req, res, next) => {
    const { first_name, last_name, email, role, password } = req.body;

    try {
        const user = await UserModel.create({
            first_name,
            last_name,
            email,
            role,
            password: createHash(password),
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put("/update/:id", async (req, res, next) => {
    const { first_name, last_name, password } = req.body;
    try {
        const user = await UserModel.findByIdAndUpdate(req.params.id,req.body,{ new: true });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/delete/:id", async (req, res, next) => {
    const { id } = req.params;
    try {
        await UserModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
