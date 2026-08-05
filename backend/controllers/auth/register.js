import User from '../../models/user.model.js';
import { preferenceQueue } from '../../queues/register.queue.js';
import qdrantService from '../../recommendation_engine/vectors/qdrant.service.js';

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