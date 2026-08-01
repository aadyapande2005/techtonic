import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    likes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }],
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    topics : [{
        type : String,
        lowercase : true,
        trim : true
    }],
    qdrantId : {
        type : String,
        default : null
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
},{timestamps:true});

const Post = new mongoose.model('Post', postSchema);

export default Post;