import Post from "../../../models/posts.model.js";
import Like from "../../../models/like.model.js";
import User from "../../../models/user.model.js";

export const getlikes = async (req, res) => {
    try {
        const postid = req.params.postid;
        const post = await Post.findOne({ _id: postid, isAvailable: { $ne: false } }, '_id likesCount');

        if(!post) {
            return res
            .status(400)
            .json({message:'post not found'});
        }

        const likes = await Like.find({ postId: postid })
            .populate({ path: 'userId', select: 'username', match: { isAvailable: { $ne: false } } });

        return res
        .status(200)
        .json({message:'all likes for post sent', post: { ...post.toObject(), likes: likes.map((like) => like.userId).filter(Boolean) }});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while getting likes`});
    }
}