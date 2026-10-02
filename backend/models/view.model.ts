import mongoose from "mongoose";

const viewSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewingTime: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

viewSchema.index({ postId: 1, userId: 1 }, { unique: true });
viewSchema.index({ postId: 1, createdAt: -1 });

const View = mongoose.model('View', viewSchema);

export default View;