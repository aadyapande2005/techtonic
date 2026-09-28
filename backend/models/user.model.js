import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
        username : {
            type : String,
            required : true,
            unique : true
        },
        email : {
            type : String,
            required : true,
            unique : true
        },
        password : {
            type : String,
            required : true,
        },
        likes : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Post'
        }],
        savedPosts : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Post'
        }],
        posts : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Post'
        }],
        qdrantId : {
            type : String,
            default : null
        },
        lastInteractionUpdate : {
            type : Date  
        },
        refreshToken : {
            type : String
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {timestamps : true}
);

userSchema.pre("save", async function () {
    if(this.isModified("password"))
        this.password = await bcrypt.hash(this.password, 10)
    //next()
})

userSchema.methods.validatePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: '1d'
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: '7d'
        }
    )
}

const User = new mongoose.model('User', userSchema);

export default User;