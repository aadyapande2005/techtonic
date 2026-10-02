import User from "../../models/user.model.js";
import Post from "../../models/posts.model.js";

export const getuser = async (req, res) => {
    try {
        const userid = req.params.userid;

        const finduser = await User.findOne(
            { _id: userid, isAvailable: { $ne: false } },
            'username email posts'
        )
            .populate({
                path: 'posts',
                match: { isAvailable: { $ne: false } },
                populate: {
                    path: 'author',
                    select: 'username email',
                    match: { isAvailable: { $ne: false } }
                }
            });

        if(!finduser) {
            return res
            .status(403)
            .json({message : 'User doesn\'t exist'});
        }

        const user = finduser.toObject();
        user.posts = (user.posts || []).filter((post) => Boolean(post?.author));

        return res
        .status(200)
        .json({message : `user fetched successfully`, user})


    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while finding user`});
    }
}