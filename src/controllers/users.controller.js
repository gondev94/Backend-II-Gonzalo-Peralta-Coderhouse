import { UserModel } from "../models/usersModel.js";

// GET /api/users - Solo ADMIN
export const getUsers = async (req, res) => {
    try {
        const users = await UserModel.find().select("-password").populate("cart");
        res.status(200).json({ status: "success", payload: users });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// GET /api/users/:id
export const getUserById = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).select("-password").populate("cart");
        if (!user) {
            return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
        }
        res.status(200).json({ status: "success", payload: user });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
    try {
        const { first_name, last_name } = req.body;
        const updateData = {};
        
        if (first_name) updateData.first_name = first_name;
        if (last_name) updateData.last_name = last_name;

        const user = await UserModel.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .select("-password");
        
        if (!user) {
            return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
        }

        res.status(200).json({ status: "success", message: "Usuario actualizado", payload: user });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// DELETE /api/users/:id - Solo ADMIN
export const deleteUser = async (req, res) => {
    try {
        const user = await UserModel.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
        }
        res.status(200).json({ status: "success", message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};
