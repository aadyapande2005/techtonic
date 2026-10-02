import Post from "../../models/posts.model.js";

export const deletepost = async (req, res) => {
    try {
        const postid = req.params.postid;
        const userid = req.user.id;

        const deletedpost = await Post.findOneAndUpdate(
            { _id: postid, author: userid, isAvailable: { $ne: false } },
            { isAvailable: false },
            { new: true }
        );

        // console.log(deletedpost);

        if(!deletedpost) {
            return res
            .status(404)
            .json({message : 'post not found'});
        }

        return res
        .status(200)
        .json({message : `post with id ${postid} marked unavailable successfully`});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while deleting post`});
    }
}