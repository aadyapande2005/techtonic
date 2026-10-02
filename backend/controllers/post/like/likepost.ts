import Post from "../../../models/posts.model.js";
import User from "../../../models/user.model.js";
import UserInteraction from "../../../models/user_interaction.model.js";
import Like from "../../../models/like.model.js";
import { profileQueue } from "../../../queues/profile.queue.js";

export const likepost = async (req, res) => {
    try {
        const userid = req.user.id;
        const postid = req.params.postid;

        const liked_post = await Post.findOne({ _id: postid, isAvailable: { $ne: false } });

        if(!liked_post) {
            return res
            .status(404)
            .json({message : 'post not found or unavailable'});
        }

        const activeUser = await User.findOne({ _id: userid, isAvailable: { $ne: false } });

        if(!activeUser) {
            return res
            .status(404)
            .json({message : 'user not found or unavailable'});
        }

        let createdLike = false;
        try {
            await Like.create({ postId: postid, userId: userid });
            createdLike = true;
        } catch (error) {
            if (error?.code !== 11000) throw error;
        }

        const updatedPost = createdLike
            ? await Post.findByIdAndUpdate(postid, { $inc: { likesCount: 1 } }, { new: true })
            : liked_post;

        await UserInteraction.create({
            userId: userid,
            postId: postid,
            qdrantId: liked_post.qdrantId,
            interactionType: 'LIKE',
        });

        await profileQueue.add(
            'profile-update',
            {
                userId: userid
            },
            { jobId: `${userid}`, removeOnComplete: true, removeOnFail: true }
        );

        return res
        .status(200)
        .json({message : `post liked successfully by user with id ${userid}`, liked_post: updatedPost});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while liking post`});
    }
}