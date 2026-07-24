import mongoose from "mongoose";


const connectdb = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Mongodb connected');
    } catch (e) {
        console.log(e);
        console.log('mongodb connection failed');
    }
}

export default connectdb;