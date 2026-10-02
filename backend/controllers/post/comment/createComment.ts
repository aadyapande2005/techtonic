import Comment from "../../../models/comment.model.js";
import Post from "../../../models/posts.model.js";
import User from "../../../models/user.model.js";
import UserInteraction from "../../../models/user_interaction.model.js";
import { profileQueue } from "../../../queues/profile.queue.js";

export const createComment = async (req, res) => {
    try {
        const userid = req.user.id;
        const postid = req.params.postid;
        const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

        if (!content) return res.status(400).json({ message: 'comment content is required' });
        if (content.length > 2000) return res.status(400).json({ message: 'comment is too long' });

        const [post, user] = await Promise.all([
            Post.findOne({ _id: postid, isAvailable: { $ne: false } }),
            User.findOne({ _id: userid, isAvailable: { $ne: false } })
        ]);
        if (!post || !user) return res.status(404).json({ message: 'post or user not found' });

        const comment = await Comment.create({ userId: userid, postId: postid, content });
        const updatedPost = await Post.findByIdAndUpdate(
            postid,
            { $inc: { commentsCount: 1 } },
            { new: true }
        );

        await UserInteraction.create({
            userId: userid,
            postId: postid,
            qdrantId: post.qdrantId,
            interactionType: 'COMMENT'
        });
        await profileQueue.add('profile-update', { userId: userid }, { jobId: `${userid}`, removeOnComplete: true, removeOnFail: true });

        await comment.populate({ path: 'userId', select: 'username email' });
        return res.status(201).json({ message: 'comment created successfully', comment, post: updatedPost });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error while creating comment' });
    }
};