import { Router } from "express";
import { UserModel } from "../models/usersModel.js";
const router = Router();

router.get("/", async (req, res, next) => {
    try {
        const users = await UserModel.find()
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


router.post("/", async (req, res, next) => {
    try {
        const user = await UserModel.create(req.body)
        res.status(201).json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.put("/:id", async (req, res, next) => {
    try {
        const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


router.delete("/:id", async (req, res, next) => {
    try {
        await UserModel.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

export default router;