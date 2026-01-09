import { Router } from "express";
import passport from "passport";
import { generateToken } from "../config/passport.js";

const router = Router();

router.post(
    "/register",
    passport.authenticate("register", { session: false, failureMessage: true }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            res.cookie("jwt-cookie", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.status(201).json({
                message: "User registered successfully",
                user: req.user,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    (err, req, res, next) => {
        res.status(400).json({ message: err.message || "Registration failed" });
    }
);

router.post(
    "/login",
    passport.authenticate("login", { session: false, failureMessage: true }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            res.cookie("jwt-cookie", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.status(200).json({
                message: "Login successful",
                user: req.user,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    (err, req, res, next) => {
        res.status(401).json({
            message: err.message || "Authentication failed",
        });
    }
);

router.get(
    "/current",
    passport.authenticate("current", { session: false, failureMessage: true }),
    async (req, res) => {
        try {
            res.status(200).json({ user: req.user });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    (err, req, res, next) => {
        res.status(401).json({
            message: "Unauthorized - Invalid or missing token",
        });
    }
);

export default router;
