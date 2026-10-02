import User from "../../models/user.model.js";

export const getusers = async (req, res) => {
    try {
        const findusers = await User.find({ isAvailable: { $ne: false } });

        if(!findusers) {
            return res
            .status(403)
            .json({message : 'User doesn\'t exist'});
        }

        return res
        .status(200)
        .json({message : `user fetched successfully`, users : findusers});


    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while finding user`});
    }
}