import { ProductModel } from "../models/productsModel.js";

// GET /api/products - Todos pueden ver productos
export const getProducts = async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, category } = req.query;
        
        const filter = {};
        if (category) filter.category = category;

        const options = {
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
        };

        if (sort) {
            options.sort = { price: sort === "asc" ? 1 : -1 };
        }

        const products = await ProductModel.find(filter)
            .limit(options.limit)
            .skip(options.skip)
            .sort(options.sort);

        const total = await ProductModel.countDocuments(filter);

        res.status(200).json({
            status: "success",
            payload: products,
            totalPages: Math.ceil(total / options.limit),
            page: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// GET /api/products/:pid
export const getProductById = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.pid);
        if (!product) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }
        res.status(200).json({ status: "success", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// POST /api/products - Solo ADMIN
export const createProduct = async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ 
                status: "error", 
                message: "Campos requeridos: title, description, code, price, stock, category" 
            });
        }

        const existingProduct = await ProductModel.findOne({ code });
        if (existingProduct) {
            return res.status(400).json({ status: "error", message: "Ya existe un producto con ese código" });
        }

        const product = await ProductModel.create({
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails: thumbnails || [],
        });

        res.status(201).json({ status: "success", message: "Producto creado", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// PUT /api/products/:pid - Solo ADMIN
export const updateProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const updateData = req.body;

        const product = await ProductModel.findByIdAndUpdate(pid, updateData, { new: true });
        if (!product) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        res.status(200).json({ status: "success", message: "Producto actualizado", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// DELETE /api/products/:pid - Solo ADMIN
export const deleteProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await ProductModel.findByIdAndDelete(pid);
        
        if (!product) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        res.status(200).json({ status: "success", message: "Producto eliminado" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};
