import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const verifyjwt = async (req, res, next) => {
    try {
        // console.log("token :",req.cookies);
        const token = req.cookies?.accessToken;
        
        if(!token) {
            return res
            .status(401)
            .json({message : 'token not present'});
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as jwt.JwtPayload & {
            _id: string;
            username: string;
            email: string;
        };

        const id = decodedToken._id;
        const username = decodedToken.username;
        const email = decodedToken.email;

        const finduser = await User.findOne({ _id: id, isAvailable: { $ne: false } });

        if(!finduser) {
            return res
            .status(403)
            .json({message : 'user doesn\'t exist'});
        }

        req.user = {id, username, email};
        next();

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : 'error while verifying jwt token'})
    }
}