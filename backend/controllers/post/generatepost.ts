import Post from "../../models/posts.model.js";
import User from "../../models/user.model.js";
import { postQueue } from "../../queues/post.queue.js";
import { sanitizeTopics } from './getposts.js';

export const generatepost = async (req, res) => {
    try {
        const userid = req.user.id;

        const {title, summary, description, caption, topics} = req.body;
        const normalizedTopics = sanitizeTopics(topics);

        if(!title || !summary?.trim() || !description) {
            return res
            .status(400)
            .json({message : 'title, summary, and description are needed for creating a post'});
        }

        if(normalizedTopics.length > 3) {
            return res
            .status(400)
            .json({message : 'maximum 3 topics are allowed'});
        }


        const activeUser = await User.findOne({ _id: userid, isAvailable: { $ne: false } });

        if(!activeUser) {
            return res
            .status(404)
            .json({message : 'active user not found'});
        }

        const newpost = await Post.create({
            title,
            summary: summary.trim(),
            description,
            caption: caption || '',
            author : userid,
            topics : normalizedTopics
        })

        if(!newpost) {
            return res
            .status(500)
            .json({message : 'error while creating post'});
        }

        const updatedUser = await User.findByIdAndUpdate(
            userid,
            { $addToSet: { posts: newpost._id } },
            { new: true }
        );

        if(!updatedUser) {
            console.log('post deleted')
            await Post.findByIdAndUpdate(newpost._id, { isAvailable: false });
            await Post.findByIdAndUpdate(newpost._id, { isAvailable: false });
            return res
            .status(404)
            .json({message : 'user not found while linking post'});
        }

        postQueue.add('insert-post', { post: newpost }, { jobId: newpost._id.toString(), removeOnComplete: true, removeOnFail: true });

        return res
        .status(200)
        .json({message : `posts created successfully by user with id ${userid}`, newpost});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while getting post`});
    }
}