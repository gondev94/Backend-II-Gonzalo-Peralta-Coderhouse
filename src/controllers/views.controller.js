import { ProductModel } from "../models/productsModel.js";
import { CartModel } from "../models/cartsModel.js";

// GET /login
export const loginView = (req, res) => {
    res.render("login");
};

// GET /register
export const registerView = (req, res) => {
    res.render("register");
};

// GET /profile
export const profileView = (req, res) => {
    const { first_name, last_name, email, role, cart } = req.session.user;
    res.render("profile", { first_name, last_name, email, role, cart });
};

// GET /products
export const productsView = async (req, res) => {
    try {
        const products = await ProductModel.find({ status: true }).lean();
        const user = req.session.user || null;
        res.render("products", { products, user });
    } catch (error) {
        res.render("error", { message: error.message });
    }
};

// GET /cart
export const cartView = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const cart = await CartModel.findOne({ user: req.session.user.id })
            .populate("products.product")
            .lean();

        if (!cart) {
            return res.render("cart", { cart: null, products: [], total: 0, user: req.session.user });
        }

        const total = cart.products.reduce((acc, item) => {
            if (item.product) {
                return acc + item.product.price * item.quantity;
            }
            return acc;
        }, 0);

        res.render("cart", { 
            cart, 
            products: cart.products, 
            total, 
            user: req.session.user,
            cartId: cart._id 
        });
    } catch (error) {
        res.render("error", { message: error.message });
    }
};

// GET /admin/products - Solo para admin
export const adminProductsView = async (req, res) => {
    try {
        const products = await ProductModel.find().lean();
        res.render("admin-products", { products, user: req.session.user });
    } catch (error) {
        res.render("error", { message: error.message });
    }
};
