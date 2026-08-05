import User from "../../models/user.model.js";

export const getuserlikes = async (req, res) => {
    try {
        const userid = req.user.id;

        const finduser = await User.findOne({ _id: userid, isAvailable: { $ne: false } }, 'likes')
            .populate({
                path: 'likes',
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

        return res
        .status(200)
        .json({message : `user likes fetched successfully`, liked_posts : finduser})


    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while finding user`});
    }
}