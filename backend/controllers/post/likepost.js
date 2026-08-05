import Post from "../../models/posts.model.js";
import User from "../../models/user.model.js";
import { profileQueue } from "../../queues/profile.queue.js";

export const likepost = async (req, res) => {
    try {
        const userid = req.user.id;
        const postid = req.params.postid;

        const liked_post = await Post.findOneAndUpdate(
            { _id: postid, isAvailable: { $ne: false } },
            { $addToSet: { likes: userid } },
            { new: true }
        );

        if(!liked_post) {
            return res
            .status(404)
            .json({message : 'post not found or unavailable'});
        }

        const likeByUser = await User.findOneAndUpdate(
            { _id: userid, isAvailable: { $ne: false } },
            { $addToSet: { likes: postid } },
            { new: true }
        );

        if(!likeByUser) {
            await Post.findByIdAndUpdate(postid, { $pull: { likes: userid } });
            return res
            .status(404)
            .json({message : 'user not found or unavailable'});
        }

        await profileQueue.add(
            'profile-update', 
            { 
                user : {
                    id: userid,
                    qdrantId: likeByUser.qdrantId,
                },
                post: liked_post 
            }, 
            { jobId: `${userid}-${postid}` }
        );

        return res
        .status(200)
        .json({message : `post liked successfully by user with id ${userid}`, liked_post});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while liking post`});
    }
}