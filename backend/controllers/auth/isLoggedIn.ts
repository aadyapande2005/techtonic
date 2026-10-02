import User from '../../models/user.model.js';

export const isLoggedIn = async (req, res) => {
    try {
        if(!req.user) {
            return res
            .status(400)
        }

        const user = await User.findOne({ _id: req.user.id, isAvailable: { $ne: false } }, 'username email');

        if(!user) {
            return res
            .status(403)
            .json({message: 'user not available'});
        }

        return res
        .status(200)
        .json({user})

    } catch (error) {
        console.log(error)
        return res
        .status(500)
        .json({message: 'error while authenticating'})
    }
}