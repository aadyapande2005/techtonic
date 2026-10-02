import mongoose from "mongoose";

const savedPostSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

savedPostSchema.index({ postId: 1, userId: 1 }, { unique: true });

const SavedPost = mongoose.model('SavedPost', savedPostSchema);

export default SavedPost;