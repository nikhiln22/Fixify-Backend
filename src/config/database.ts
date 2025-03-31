import mongoose from 'mongoose';
import config from './env'

interface IDatabase {
    connect(): Promise<void>;
};

class MongoDBConnection implements IDatabase {
    public async connect(): Promise<void> {
        try {
            await mongoose.connect(config.MONGODB_URL);
            console.log("MongoDB connected successfully");
        } catch (error) {
            console.error("MongoDB connection error", error);
            process.exit(1)
        }
    }
}

export const database: IDatabase = new MongoDBConnection();