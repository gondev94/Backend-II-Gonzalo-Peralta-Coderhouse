import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { UserModel } from "../../src/models/usersModel.js";
import { createHash, isValidPassword } from "../../utils.js";


export function initializePassport() { 
    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email",
        passwordField: "password",
        session: true,
    },
        async (req, username, password, done) => {
            try {
            password = createHash(password);
                const newUser = await userModel.create({ ...req.body, password });
                done(null, newUser);
        } catch (error) {
            
        }
    }))
}