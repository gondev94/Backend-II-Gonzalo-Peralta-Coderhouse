import { dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";


export const serverRoot = dirname(fileURLToPath(import.meta.url));

export function createHash(password) { 
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export function isValidPassword(password, hashedpassword) { 
    return bcrypt.compareSync(password, hashedpassword);
}

