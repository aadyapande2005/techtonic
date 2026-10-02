import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    summary : {
        type : String,
        required : true,
        trim : true
    },
    description : {
        type : mongoose.Schema.Types.Mixed,
        required : true
    },
    caption : {
        type : String,
        required : false,
        default: ''
    },
    likesCount: {
        type: Number,
        default: 0,
        min: 0
    },
    commentsCount: {
        type: Number,
        default: 0,
        min: 0
    },
    viewsCount: {
        type: Number,
        default: 0,
        min: 0
    },
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

const Post = mongoose.model('Post', postSchema);

export default Post;