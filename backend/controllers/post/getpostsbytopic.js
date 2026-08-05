import Post from "../../models/posts.model.js";
import { buildTopicSearchRegex } from './getposts.js';


export const getpostsbytopic = async (req, res) => {
    try {
        const topic = String(req.params.topic || '').trim().toLowerCase();

        if(!topic) {
            return res
            .status(400)
            .json({message : 'topic is required'});
        }

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 20);
        const skip = (page - 1) * limit;

        const topicRegex = buildTopicSearchRegex(topic);
        const topicFilter = {
            topics: { $elemMatch: { $regex: topicRegex } },
            isAvailable: { $ne: false }
        };

        const totalPosts = await Post.countDocuments(topicFilter);

        const posts = await Post.find(topicFilter)
            .populate({ path: 'author', select: 'username email', match: { isAvailable: { $ne: false } } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const availablePosts = posts.filter((post) => Boolean(post.author));

        const totalPages = Math.max(Math.ceil(totalPosts / limit), 1);

        return res
        .status(200)
        .json({
            message : `posts loaded successfully for topic ${topic}`,
            posts: availablePosts,
            pagination: {
                page,
                limit,
                totalPosts,
                totalPages,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages
            },
            topic
        })

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : 'error while getting posts by topic'});
    }
}