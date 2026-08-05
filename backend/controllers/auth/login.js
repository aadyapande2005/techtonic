import User from '../../models/user.model.js';

export const login = async (req, res) => {
    try {
        console.log(process.env.CORS_ORIGIN);
        const {username, email, password} = req.body;

        if(!password) {
            return res
            .status(400)
            .json({message : 'password is required for login'});
        }

        if(!username && !email) {
            return res
            .status(400)
            .json({message : 'Username or email is required for login'});
        }

        const finduser = await User.findOne({
            $or : [{username}, {email}],
            isAvailable: { $ne: false }
        });

        if(!finduser) {
            return res
            .status(400)
            .json({message : 'user does not exist'});
        }

        //const foundpassword = finduser.password;

        const isPasswordCorrect = await finduser.validatePassword(password)

        if(!isPasswordCorrect) {
            return res
            .status(400)
            .json({message : 'Wrong password'});
        }

        const accessToken = finduser.generateAccessToken();

        const {password: userpassword, refreshToken, ...user} = finduser.toObject()

        res
        .status(200)
        .cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        .json({message : 'Login successful', user});

    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({message : 'Error while logging in...'})
    }  
}