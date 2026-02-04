import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/usersModel.js";
import { CartModel } from "../models/cartsModel.js";
import { createHash, isValidPassword } from "../../utils.js";
import jwt from "jsonwebtoken";

// Variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || "firmadelserlserver";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.BASE_URL || "http://localhost:7777";

export function initializePassport() {
    // Estrategia de registro local
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

    // Estrategia de login local
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

    // Estrategia JWT para verificar sesión
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

    // Estrategia de Google OAuth2 (solo si hay credenciales configuradas)
    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
        passport.use(
            "google",
            new GoogleStrategy(
                {
                    clientID: GOOGLE_CLIENT_ID,
                    clientSecret: GOOGLE_CLIENT_SECRET,
                    callbackURL: `${BASE_URL}/api/sessions/google/callback`,
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        // Buscar si el usuario ya existe
                        let user = await UserModel.findOne({ email: profile.emails[0].value });

                        if (!user) {
                            // Crear nuevo usuario con datos de Google
                            user = await UserModel.create({
                                first_name: profile.name.givenName || profile.displayName,
                                last_name: profile.name.familyName || "",
                                email: profile.emails[0].value,
                                password: createHash("google-oauth-" + profile.id),
                                role: "user",
                            });

                            // Crear carrito para el nuevo usuario
                            const newCart = await CartModel.create({ user: user._id, products: [] });
                            await UserModel.findByIdAndUpdate(user._id, { cart: newCart._id });
                            user.cart = newCart._id;
                        }

                        return done(null, user);
                    } catch (error) {
                        return done(error);
                    }
                }
            )
        );
        console.log(" Google OAuth configurado correctamente");
    } else {
        console.log("  Google OAuth no configurado (falta GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env)");
    }

    // Serialización para sesiones
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await UserModel.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
}

export function generateToken(user) {
    return jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
        expiresIn: "24h",
    });
}
