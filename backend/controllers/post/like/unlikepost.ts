import Post from "../../../models/posts.model.js";
import UserInteraction from "../../../models/user_interaction.model.js";
import Like from "../../../models/like.model.js";
import { profileQueue } from "../../../queues/profile.queue.js";

export const unlikepost = async (req, res) => {
    try {
        const userid = req.user.id;
        const postid = req.params.postid;

        const liked_post = await Post.findOne({ _id: postid, isAvailable: { $ne: false } });

        if(!liked_post) {
            return res
            .status(404)
            .json({message : 'post not found or unavailable'});
        }

        const deletedLike = await Like.deleteOne({ postId: postid, userId: userid });
        const updatedPost = deletedLike.deletedCount
            ? await Post.findByIdAndUpdate(
                postid,
                { $inc: { likesCount: -1 } },
                { new: true }
            )
            : liked_post;

        await UserInteraction.create({
            userId: userid,
            postId: postid,
            qdrantId: liked_post.qdrantId,
            interactionType: 'UNLIKE'
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
        .json({message : `post unliked successfully by user with id ${userid}`, liked_post: updatedPost});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while unliking post`});
    }
}