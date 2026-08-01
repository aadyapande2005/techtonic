import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../.env")
});


const connectdb = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Mongodb connected');
    } catch (e) {
        console.log(e);
        console.log('mongodb connection failed');
        throw e;
    }
}

export default connectdb;