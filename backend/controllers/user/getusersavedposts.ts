import User from "../../models/user.model.js";
import SavedPost from "../../models/saved_post.model.js";

export const getusersavedposts = async (req, res) => {
    try {
        const userid = req.user.id;

        const finduser = await User.findOne({ _id: userid, isAvailable: { $ne: false } }, '_id');

        if(!finduser) {
            return res
            .status(403)
            .json({message : 'User doesn\'t exist'});
        }

        const savedPosts = await SavedPost.find({ userId: userid })
            .populate({
                path: 'postId',
                match: { isAvailable: { $ne: false } },
                populate: {
                    path: 'author',
                    select: 'username email',
                    match: { isAvailable: { $ne: false } }
                }
            });

        return res
        .status(200)
        .json({message : `user saved posts fetched successfully`, saved_posts : { savedPosts: savedPosts.map((savedPost) => savedPost.postId).filter(Boolean) }})


    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while finding user saved posts`});
    }
}