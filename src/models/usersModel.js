import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts",
        default: null
    },
    role: {
        type: String,
        default: "user",
    }
})

export const UserModel = mongoose.model("users", userSchema);