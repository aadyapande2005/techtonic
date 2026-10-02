import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    }
}, { timestamps: true });

commentSchema.index({ postId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;