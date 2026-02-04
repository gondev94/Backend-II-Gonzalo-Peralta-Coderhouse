import { CartModel } from "../models/cartsModel.js";
import { ProductModel } from "../models/productsModel.js";
import { TicketModel } from "../models/ticketsModel.js";
import { UserModel } from "../models/usersModel.js";

// GET /api/carts/:cid - Ver carrito del usuario
export const getCart = async (req, res) => {
    try {
        const { cid } = req.params;

        // Verificar que el usuario es dueño del carrito o es admin
        const cart = await CartModel.findById(cid).populate("products.product");
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        if (cart.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ status: "error", message: "No tienes acceso a este carrito" });
        }

        // Calcular total
        const total = cart.products.reduce((acc, item) => {
            if (item.product) {
                return acc + item.product.price * item.quantity;
            }
            return acc;
        }, 0);

        res.status(200).json({ 
            status: "success", 
            payload: { ...cart.toObject(), total } 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// GET /api/carts/my-cart - Obtener carrito del usuario actual
export const getMyCart = async (req, res) => {
    try {
        let cart = await CartModel.findOne({ user: req.user._id }).populate("products.product");
        
        // Si no tiene carrito, crear uno
        if (!cart) {
            cart = await CartModel.create({ user: req.user._id, products: [] });
            await UserModel.findByIdAndUpdate(req.user._id, { cart: cart._id });
        }

        const total = cart.products.reduce((acc, item) => {
            if (item.product) {
                return acc + item.product.price * item.quantity;
            }
            return acc;
        }, 0);

        res.status(200).json({ 
            status: "success", 
            payload: { ...cart.toObject(), total } 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// POST /api/carts/:cid/products/:pid - Agregar producto al carrito (Solo USER)
export const addProductToCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity = 1 } = req.body;

        // Verificar que el carrito pertenece al usuario
        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        if (cart.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: "error", message: "No tienes acceso a este carrito" });
        }

        // Verificar que el producto existe y tiene stock
        const product = await ProductModel.findById(pid);
        if (!product) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ status: "error", message: `Stock insuficiente. Disponible: ${product.stock}` });
        }

        // Agregar o actualizar cantidad
        const existingProduct = cart.products.find(p => p.product.toString() === pid);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.products.push({ product: pid, quantity });
        }

        await cart.save();
        await cart.populate("products.product");

        res.status(200).json({ status: "success", message: "Producto agregado", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// PUT /api/carts/:cid/products/:pid - Actualizar cantidad (Solo USER)
export const updateProductQuantity = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ status: "error", message: "Cantidad inválida" });
        }

        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        if (cart.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: "error", message: "No tienes acceso a este carrito" });
        }

        const productItem = cart.products.find(p => p.product.toString() === pid);
        if (!productItem) {
            return res.status(404).json({ status: "error", message: "Producto no está en el carrito" });
        }

        productItem.quantity = quantity;
        await cart.save();
        await cart.populate("products.product");

        res.status(200).json({ status: "success", message: "Cantidad actualizada", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// DELETE /api/carts/:cid/products/:pid - Eliminar producto del carrito (Solo USER)
export const removeProductFromCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        if (cart.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: "error", message: "No tienes acceso a este carrito" });
        }

        cart.products = cart.products.filter(p => p.product.toString() !== pid);
        await cart.save();
        await cart.populate("products.product");

        res.status(200).json({ status: "success", message: "Producto eliminado del carrito", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// DELETE /api/carts/:cid - Vaciar carrito (cancelar compra)
export const clearCart = async (req, res) => {
    try {
        const { cid } = req.params;

        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        if (cart.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: "error", message: "No tienes acceso a este carrito" });
        }

        cart.products = [];
        await cart.save();

        res.status(200).json({ status: "success", message: "Carrito vaciado" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// POST /api/carts/:cid/purchase - Realizar compra (Solo USER)
export const purchaseCart = async (req, res) => {
    try {
        const { cid } = req.params;

        const cart = await CartModel.findById(cid).populate("products.product");
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        if (cart.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: "error", message: "No tienes acceso a este carrito" });
        }

        if (cart.products.length === 0) {
            return res.status(400).json({ status: "error", message: "El carrito está vacío" });
        }

        const purchasedProducts = [];
        const failedProducts = [];
        let totalAmount = 0;

        // Procesar cada producto
        for (const item of cart.products) {
            const product = await ProductModel.findById(item.product._id);

            if (product && product.stock >= item.quantity) {
                // Hay stock suficiente
                product.stock -= item.quantity;
                await product.save();

                purchasedProducts.push({
                    product: product._id,
                    title: product.title,
                    price: product.price,
                    quantity: item.quantity,
                });
                totalAmount += product.price * item.quantity;
            } else {
                // No hay stock suficiente
                failedProducts.push({
                    product: item.product._id,
                    title: item.product.title,
                    requestedQuantity: item.quantity,
                    availableStock: product ? product.stock : 0,
                });
            }
        }

        if (purchasedProducts.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "No se pudo procesar la compra - productos sin stock",
                failedProducts,
            });
        }

        // Crear ticket
        const ticketCode = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const ticket = await TicketModel.create({
            code: ticketCode,
            amount: totalAmount,
            purchaser: req.user.email,
            products: purchasedProducts,
        });

        // Actualizar carrito: dejar solo productos que fallaron
        cart.products = cart.products.filter(item =>
            failedProducts.some(fp => fp.product.toString() === item.product._id.toString())
        );
        await cart.save();

        res.status(200).json({
            status: "success",
            message: failedProducts.length > 0 
                ? "Compra parcial - algunos productos sin stock" 
                : "Compra realizada exitosamente",
            payload: {
                ticket: {
                    code: ticket.code,
                    amount: ticket.amount,
                    purchaser: ticket.purchaser,
                    products: ticket.products,
                    purchase_datetime: ticket.purchase_datetime,
                },
                failedProducts: failedProducts.length > 0 ? failedProducts : undefined,
            },
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};
