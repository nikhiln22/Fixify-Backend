import { IPasswordHasher } from '../interfaces/IpasswordHasher/IpasswordHasher'
import argon2 from 'argon2'

export class PasswordHasher implements IPasswordHasher {
    async hash(password: string): Promise<string> {
        return argon2.hash(password)
    }

    async verify(hashedPassword: string, plainPassword: string): Promise<Boolean> {
        return argon2.verify(hashedPassword, plainPassword)
    }
}