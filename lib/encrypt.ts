// lib/encrypt.ts
import bcrypt from "bcryptjs";

export async function compare(
    password: string,
    hashedPassword: string
) {
    return bcrypt.compare(password, hashedPassword);
}