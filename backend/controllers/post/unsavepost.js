import Post from "../../models/posts.model.js";
import User from "../../models/user.model.js";

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

        const unsavedByUser = await User.findOneAndUpdate(
            { _id: userid, isAvailable: { $ne: false } },
            { $pull: { savedPosts: postid } },
            { new: true }
        );

        if(!unsavedByUser) {
            return res
            .status(404)
            .json({message : 'user not found or unavailable'});
        }

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