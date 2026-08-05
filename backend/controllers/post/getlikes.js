import Post from "../../models/posts.model.js";

export const getlikes = async (req, res) => {
    try {
        const postid = req.params.postid;
        const post = await Post.findOne({ _id: postid, isAvailable: { $ne: false } }, 'likes')
            .populate({ path: 'likes', select: 'username', match: { isAvailable: { $ne: false } } });

        if(!post) {
            return res
            .status(400)
            .json({message:'post not found'});
        }

        return res
        .status(200)
        .json({message:'all likes for post sent', post});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while getting likes`});
    }
}