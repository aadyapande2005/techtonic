import User from "../../models/user.model.js";
import Post from "../../models/posts.model.js";

export const deleteuser = async (req, res) => {
    try {
        const userid = req.user?.id;

        const finduser = await User.findOneAndUpdate(
            { _id: userid, isAvailable: { $ne: false } },
            { isAvailable: false },
            { new: true }
        );

        if(!finduser) {
            return res
            .status(403)
            .json({message : 'User doesn\'t exist'});
        }

        await Post.updateMany(
            { author: userid, isAvailable: { $ne: false } },
            { isAvailable: false }
        );

        return res
        .status(200)
        .json({message : 'user and authored posts marked unavailable successfully'});


    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while deleting user`});
    }
}