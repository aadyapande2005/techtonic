import Post from "../../models/posts.model.js";
import User from "../../models/user.model.js";

export const unlikepost = async (req, res) => {
    try {
        const userid = req.user.id;
        const postid = req.params.postid;

        const liked_post = await Post.findOneAndUpdate(
            { _id: postid, isAvailable: { $ne: false } },
            { $pull: { likes: userid } },
            { new: true }
        );

        if(!liked_post) {
            return res
            .status(404)
            .json({message : 'post not found or unavailable'});
        }
        
        const user_liked_post = await User.findOneAndUpdate(
            { _id: userid, isAvailable: { $ne: false } },
            { $pull: { likes: postid } },
            { new: true }
        );

        if(!user_liked_post) {
            return res
            .status(404)
            .json({message : 'user not found or unavailable'});
        }

        return res
        .status(200)
        .json({message : `post unliked successfully by user with id ${userid}`, liked_post});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while liking post`});
    }
}