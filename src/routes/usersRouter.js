import { Router } from "express";
import { getUsers, getUserById, updateUser, deleteUser } from "../controllers/users.controller.js";
import { authenticateJWT, isAdmin, isAdminOrSelf } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/users - Solo ADMIN
router.get("/", authenticateJWT, isAdmin, getUsers);

// GET /api/users/:id - Admin o el mismo usuario
router.get("/:id", authenticateJWT, isAdminOrSelf, getUserById);

// PUT /api/users/:id - Admin o el mismo usuario
router.put("/:id", authenticateJWT, isAdminOrSelf, updateUser);

// DELETE /api/users/:id - Solo ADMIN
router.delete("/:id", authenticateJWT, isAdmin, deleteUser);

export default router;
