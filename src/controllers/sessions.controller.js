import { UserModel } from "../models/usersModel.js";
import { CartModel } from "../models/cartsModel.js";
import { generateToken } from "../config/passport.js";

// POST /api/sessions/register
export const register = async (req, res) => {
    try {
        // Crear carrito para el nuevo usuario
        const newCart = await CartModel.create({ user: req.user._id, products: [] });
        
        // Actualizar usuario con su carrito
        await UserModel.findByIdAndUpdate(req.user._id, { cart: newCart._id });

        const token = generateToken(req.user);
        res.cookie("jwt-cookie", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        // Guardar en sesión (igual que en login)
        req.session.user = {
            id: req.user._id,
            email: req.user.email,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            role: req.user.role,
            cart: newCart._id,
        };

        res.status(201).json({
            status: "success",
            message: "Usuario registrado exitosamente",
            payload: req.session.user,
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// POST /api/sessions/login
export const login = async (req, res) => {
    try {
        const token = generateToken(req.user);
        res.cookie("jwt-cookie", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        // Guardar en sesión
        req.session.user = {
            id: req.user._id,
            email: req.user.email,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            role: req.user.role,
            cart: req.user.cart,
        };

        res.status(200).json({
            status: "success",
            message: "Login exitoso",
            payload: req.session.user,
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// GET /api/sessions/current
export const current = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id)
            .select("-password")
            .populate("cart");
        res.status(200).json({ status: "success", payload: user });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// POST /api/sessions/logout
export const logout = (req, res) => {
    res.clearCookie("jwt-cookie");
    req.session.destroy();
    res.status(200).json({ status: "success", message: "Sesión cerrada" });
};
