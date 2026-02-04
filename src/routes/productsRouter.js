import { Router } from "express";
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from "../controllers/products.controller.js";
import { authenticateJWT, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/products - Público (todos pueden ver)
router.get("/", getProducts);

// GET /api/products/:pid - Público
router.get("/:pid", getProductById);

// POST /api/products - Solo ADMIN
router.post("/", authenticateJWT, isAdmin, createProduct);

// PUT /api/products/:pid - Solo ADMIN
router.put("/:pid", authenticateJWT, isAdmin, updateProduct);

// DELETE /api/products/:pid - Solo ADMIN
router.delete("/:pid", authenticateJWT, isAdmin, deleteProduct);

export default router;
