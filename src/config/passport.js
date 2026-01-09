import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { UserModel } from "../models/usersModel.js";
import { createHash, isValidPassword } from "../../utils.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "firmadelserlserver"; // Deberías usar una variable de entorno

export function initializePassport() {

    passport.use(
        "register",
        new LocalStrategy(
            {
                passReqToCallback: true,
                usernameField: "email",
                passwordField: "password",
                session: false,
            },
            async (req, username, password, done) => {
                try {
                    const hashedPassword = createHash(password);
                    const newUser = await UserModel.create({
                        ...req.body,
                        password: hashedPassword,
                    });
                    done(null, newUser);
                } catch (error) {
                    done(error);
                }
            }
        )
    );

    passport.use(
        "login",
        new LocalStrategy(
            {
                usernameField: "email",
                passwordField: "password",
                session: false,
            },
            async (username, password, done) => {
                try {
                    const user = await UserModel.findOne({ email: username });
                    if (!user) {
                        return done(null, false, { message: "User not found" });
                    }
                    if (!isValidPassword(password, user.password)) {
                        return done(null, false, {
                            message: "Invalid password",
                        });
                    }
                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.use(
        "current",
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([
                    (req) => {
                        let token = null;
                        if (req && req.cookies) {
                            token = req.cookies["jwt-cookie"];
                        }
                        return token;
                    },
                ]),
                secretOrKey: JWT_SECRET,
            },
            async (jwt_payload, done) => {
                try {
                    const user = await UserModel.findById(jwt_payload.userId);
                    if (!user) {
                        return done(null, false);
                    }
                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
}

export function generateToken(user) {
    return jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
        expiresIn: "24h",
    });
}
