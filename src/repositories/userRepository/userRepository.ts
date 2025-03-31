import { IuserRepository } from '../../interfaces/Irepositories/IuserRepository';
import { Iuser } from '../../interfaces/Models/Iuser';
import user from '../../models/userModel'
import { ItempUser } from '../../interfaces/Models/ItempUser';
import { createTempUserResponseDTO, findByEmailResponseDTO, findTempUserByIdDTO, createUserDTO } from '../../interfaces/DTO/IRepository/userRepositoryDTO';
import mongoose from 'mongoose';
import tempUser from '../../models/tempUserModel';

export class UserRepository implements IuserRepository {

    async createUser(userData: createUserDTO): Promise<Iuser> {
        try {
            const newUser = new user(userData);
            const savedUser = await newUser.save()
            console.log("savedUser from userRepository:", savedUser);
            if (!savedUser) {
                throw new Error("cannot be saved");
            }
            return savedUser
        } catch (error) {
            throw new Error("Error occured while creating new user");
        }
    }

    async createTempUser(userData: ItempUser): Promise<createTempUserResponseDTO> {
        try {
            console.log("entering into the temporary user creating function");
            const temporaryUser = new tempUser(userData);
            console.log("temporaryUser:", temporaryUser);
            const savedTemporaryUser = await temporaryUser.save()
            console.log("savedTemporaryUser from userRepository:", savedTemporaryUser);
            let tempUserId = (savedTemporaryUser._id as mongoose.Types.ObjectId).toString();
            if (!savedTemporaryUser) {
                throw new Error("cannot be saved");
            }
            return { success: true, tempUserId }
        } catch (error) {
            console.log(error);
            throw new Error("Error occured while creating new user");
        }
    }

    async findByEmail(email: string): Promise<findByEmailResponseDTO> {
        try {
            const userData = await user.findOne({ email: email });
            if (userData) {
                return { success: true, userData }
            } else {
                return { success: false }
            }
        } catch (error) {
            console.log("error occured while fetching the user");
            throw new Error("An error occurred while retrieving the user");
        }
    }

    async findTempUserById(tempUserId: string): Promise<findTempUserByIdDTO> {
        try {
            const tempSavedUser = await tempUser.findById(tempUserId);
            console.log("tempSavedUser:", tempSavedUser);
            if (tempSavedUser) {
                return { success: true, tempUserData: tempSavedUser };
            } else {
                return { success: false, message: "Temporary user not found or expired" };
            }
        } catch (error) {
            console.log("Error fetching temporary user:", error);
            throw new Error("An error occurred while retrieving the temporary user");
        }
    }

}