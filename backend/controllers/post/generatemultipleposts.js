import Post from "../../models/posts.model.js";
import User from "../../models/user.model.js";
import { sanitizeTopics } from './getposts.js';

export const generatemultipleposts = async (req, res) => {
    try {
        const userid = req.user.id;
        const { posts } = req.body;

        if(!Array.isArray(posts) || posts.length === 0) {
            return res
            .status(400)
            .json({message : 'posts must be a non-empty array'});
        }

        const activeUser = await User.findOne({ _id: userid, isAvailable: { $ne: false } });

        if(!activeUser) {
            return res
            .status(404)
            .json({message : 'active user not found'});
        }

        const createdPosts = [];

        for (const post of posts) {
            const title = String(post?.title || '').trim();
            const description = String(post?.description || '').trim();
            const normalizedTopics = sanitizeTopics(post?.topics);

            if(!title || !description) {
                continue;
            }

            if(normalizedTopics.length > 3) {
                return res
                .status(400)
                .json({message : 'maximum 3 topics are allowed per post'});
            }

            const newpost = await Post.create({
                title,
                description,
                author: userid,
                topics: normalizedTopics
            });

            createdPosts.push(newpost);
        }

        if(createdPosts.length === 0) {
            return res
            .status(400)
            .json({message : 'no valid posts found in request'});
        }

        await User.findByIdAndUpdate(
            userid,
            { $addToSet: { posts: { $each: createdPosts.map((post) => post._id) } } },
            { new: true }
        );

        return res
        .status(200)
        .json({
            message : `multiple posts created successfully by user with id ${userid}`,
            count: createdPosts.length,
            posts: createdPosts
        });

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : 'error while creating multiple posts'});
    }
}