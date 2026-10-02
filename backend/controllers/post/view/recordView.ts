import Post from "../../../models/posts.model.js";
import User from "../../../models/user.model.js";
import View from "../../../models/view.model.js";
import UserInteraction from "../../../models/user_interaction.model.js";
import { profileQueue } from "../../../queues/profile.queue.js";

const MINIMUM_VIEWING_TIME = 60;

export const recordView = async (req, res) => {
    try {
        const userid = req.user.id;
        const postid = req.params.postid;
        const viewingTime = Number(req.body.viewingTime);

        if (!Number.isFinite(viewingTime) || viewingTime < 0) {
            return res.status(400).json({ message: 'viewingTime must be a non-negative number of seconds' });
        }

        const [post, user] = await Promise.all([
            Post.findOne({ _id: postid, isAvailable: { $ne: false } }),
            User.findOne({ _id: userid, isAvailable: { $ne: false } })
        ]);
        if (!post || !user) return res.status(404).json({ message: 'post or user not found' });

        if (viewingTime <= MINIMUM_VIEWING_TIME) {
            return res.status(200).json({ message: 'view did not meet the minimum viewing time', counted: false });
        }

        const existingView = await View.exists({ postId: postid, userId: userid });
        if (existingView) {
            return res.status(200).json({ message: 'view already counted for this user', counted: false, alreadyCounted: true });
        }

        try {
            await View.create({ postId: postid, userId: userid, viewingTime });
        } catch (error) {
            if (error?.code === 11000) {
                return res.status(200).json({ message: 'view already counted for this user', counted: false, alreadyCounted: true });
            }
            throw error;
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postid,
            { $inc: { viewsCount: 1 } },
            { new: true }
        );
        await UserInteraction.create({
            userId: userid,
            postId: postid,
            qdrantId: post.qdrantId,
            interactionType: 'VIEW',
            metadata: { viewingTime }
        });
        await profileQueue.add('profile-update', { userId: userid }, { jobId: `${userid}`, removeOnComplete: true, removeOnFail: true });

        return res.status(201).json({ message: 'view recorded successfully', counted: true, post: updatedPost });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error while recording view' });
    }
};