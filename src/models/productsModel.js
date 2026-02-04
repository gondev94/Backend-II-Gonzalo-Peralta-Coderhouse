import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
        },
        price: {
            type: Number,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        category: {
            type: String,
            required: true,
        },
        thumbnails: {
            type: [String],
            default: [],
        },
        status: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const ProductModel = mongoose.model("products", productSchema);
