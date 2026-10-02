import User from '../models/user.model.js';
import { preferenceQueue } from '../queues/register.queue.js';
import qdrantService from '../recommendation_engine/vectors/qdrant.service.js';



export const register = async (req, res) => {
    try {
        const {username, email, password, interests} = req.body;

        if(!username && !email && !password){
            return res
            .status(400)
            .json({message : 'Enter values for all fields'});
        }

        const finduser = await User.findOne({
            username
        });

        if(finduser){
            return res
            .status(400)
            .json({message : 'username or email not available'});
        }

        const newuser = await User.create({
            username,
            email,
            password
        })

        await preferenceQueue.add('user-preference-initialize', {
                user: {
                    id: newuser._id,
                    username: newuser.username,
                    email: newuser.email,
                    interests: interests
                }
            },
            {
                jobId: newuser._id.toString(),
            }
        );

        // const accessToken = newuser.generateAccessToken();
        const refreshToken = newuser.generateRefreshToken();

        newuser.refreshToken = refreshToken;

        await newuser.save();

        return res
        .status(200)
        .json({message : 'register successful', user : newuser});
    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : 'Error while registering...'})
    }    
}

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

export const logout = async (req, res) => {
    try {        
        res
        .status(200)
        .clearCookie('accessToken')
        .json({message : 'logout successful'});
    } catch (error) {
        res
        .status(500)
        .json({message : 'Error while logging out...'})
    }  
}

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



