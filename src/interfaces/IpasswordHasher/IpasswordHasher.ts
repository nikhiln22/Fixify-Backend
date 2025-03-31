
export interface IPasswordHasher {
    hash(password: string): Promise<string>;
    verify(hashPassword: string, plainPassword: string): Promise<Boolean>
}