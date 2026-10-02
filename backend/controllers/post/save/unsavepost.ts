import Post from "../../../models/posts.model.js";
import UserInteraction from "../../../models/user_interaction.model.js";
import SavedPost from "../../../models/saved_post.model.js";
import { profileQueue } from "../../../queues/profile.queue.js";

export const unsavepost = async (req, res) => {
    try {
        const userid = req.user.id;
        const postid = req.params.postid;

        const postToUnsave = await Post.findOne({ _id: postid, isAvailable: { $ne: false } });

        if(!postToUnsave) {
            return res
            .status(404)
            .json({message : 'post not found or unavailable'});
        }

        await SavedPost.deleteOne({ postId: postid, userId: userid });

        await UserInteraction.create({
            userId: userid,
            postId: postid,
            qdrantId: postToUnsave.qdrantId,
            interactionType: 'UNSAVE'
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
        .json({message : `post unsaved successfully by user with id ${userid}`});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while unsaving post`});
    }
}