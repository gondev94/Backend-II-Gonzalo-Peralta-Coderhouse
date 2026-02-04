import { Router } from "express";
import { 
    getCart,
    getMyCart,
    addProductToCart, 
    updateProductQuantity,
    removeProductFromCart, 
    clearCart,
    purchaseCart 
} from "../controllers/carts.controller.js";
import { authenticateJWT, isUser } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/carts/my-cart - Obtener mi carrito (Usuario autenticado)
router.get("/my-cart", authenticateJWT, getMyCart);

// GET /api/carts/:cid - Ver carrito específico
router.get("/:cid", authenticateJWT, getCart);

// POST /api/carts/:cid/products/:pid - Agregar producto (Solo USER)
router.post("/:cid/products/:pid", authenticateJWT, isUser, addProductToCart);

// PUT /api/carts/:cid/products/:pid - Actualizar cantidad (Solo USER)
router.put("/:cid/products/:pid", authenticateJWT, isUser, updateProductQuantity);

// DELETE /api/carts/:cid/products/:pid - Eliminar producto del carrito (Solo USER)
router.delete("/:cid/products/:pid", authenticateJWT, isUser, removeProductFromCart);

// DELETE /api/carts/:cid - Vaciar/Cancelar carrito (Solo USER)
router.delete("/:cid", authenticateJWT, isUser, clearCart);

// POST /api/carts/:cid/purchase - Realizar compra (Solo USER)
router.post("/:cid/purchase", authenticateJWT, isUser, purchaseCart);

export default router;
