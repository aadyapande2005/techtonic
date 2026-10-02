import Post from "../../models/posts.model.js";

export const getpost = async (req, res) => {
    try {
        const postid = req.params.postid;

        const findpost = await Post.findOne({ _id: postid, isAvailable: { $ne: false } })
            .populate({ path: 'author', select: 'username email', match: { isAvailable: { $ne: false } } });

        if(!findpost || !findpost.author) {
            return res
            .status(403)
            .json({message : 'this post doesn\'t exist'});
        }

        return res
        .status(200)
        .json({message : `posts with id ${postid} loaded successfully`, findpost});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while getting post`});
    }
}