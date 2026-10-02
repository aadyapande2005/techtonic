import User from "../../models/user.model.js";

export const updateuser = async (req, res) => {
    try {
        const {username, email} = req.body;

        const userid = req.user.id;

        let finduser = await User.findOne({ _id: userid, isAvailable: { $ne: false } });

        if(!finduser) {
            return res
            .status(403)
            .json({message : 'User doesn\'t exist'});
        }

        if(username !== finduser.username) 
            finduser = await User.findByIdAndUpdate(userid, { username }, { new: true, runValidators: true });
        if(email !== finduser.email) 
            finduser = await User.findByIdAndUpdate(userid, { email }, { new: true, runValidators: true });

        return res
        .status(200)
        .json({message : `user updated successfully`, users : finduser});


    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while updating user`});
    }
}