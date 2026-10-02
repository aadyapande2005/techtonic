import Post from "../../../models/posts.model.js";
import User from "../../../models/user.model.js";
import UserInteraction from "../../../models/user_interaction.model.js";
import SavedPost from "../../../models/saved_post.model.js";
import { profileQueue } from "../../../queues/profile.queue.js";

export const savepost = async (req, res) => {
    try {
        const userid = req.user.id;
        const postid = req.params.postid;

        const postToSave = await Post.findOne({ _id: postid, isAvailable: { $ne: false } });

        if(!postToSave) {
            return res
            .status(404)
            .json({message : 'post not found or unavailable'});
        }

        const savedByUser = await User.findOne({ _id: userid, isAvailable: { $ne: false } });

        if(!savedByUser) {
            return res
            .status(404)
            .json({message : 'user not found or unavailable'});
        }

        await SavedPost.updateOne(
            { postId: postid, userId: userid },
            { $setOnInsert: { postId: postid, userId: userid } },
            { upsert: true }
        );

        await UserInteraction.create({
            userId: userid,
            postId: postid,
            qdrantId: postToSave.qdrantId,
            interactionType: 'SAVE',
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
        .json({message : `post saved successfully by user with id ${userid}`});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while saving post`});
    }
}