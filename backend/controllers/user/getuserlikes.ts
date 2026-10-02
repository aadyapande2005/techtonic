import User from "../../models/user.model.js";
import Like from "../../models/like.model.js";

export const getuserlikes = async (req, res) => {
    try {
        const userid = req.user.id;

        const finduser = await User.findOne({ _id: userid, isAvailable: { $ne: false } }, '_id');

        if(!finduser) {
            return res
            .status(403)
            .json({message : 'User doesn\'t exist'});
        }

        const likes = await Like.find({ userId: userid })
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
        .json({message : `user likes fetched successfully`, liked_posts : { likes: likes.map((like) => like.postId).filter(Boolean) }})


    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while finding user`});
    }
}