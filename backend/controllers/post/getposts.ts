import Post from "../../models/posts.model.js";
import User from "../../models/user.model.js";
import { postQueue } from "../../queues/post.queue.js";
import { profileQueue } from "../../queues/profile.queue.js";

export const sanitizeTopics = (topics) => {
    if (!topics) return [];

    const inputTopics = Array.isArray(topics)
        ? topics
        : String(topics).split(',');

    const normalized = inputTopics
        .map((topic) => String(topic).trim().toLowerCase())
        .filter(Boolean);

    return [...new Set(normalized)];
}

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildTopicSearchRegex = (query) => {
    const escapedQuery = escapeRegex(query);

    // ILIKE-style contains match (case-insensitive), e.g. "front" -> "frontend".
    return new RegExp(escapedQuery, 'i');
};

export const getposts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 20);
        const skip = (page - 1) * limit;

        const totalPosts = await Post.countDocuments({ isAvailable: { $ne: false } });

        const posts = await Post.find({ isAvailable: { $ne: false } })
            .populate({ path: 'author', select: 'username email', match: { isAvailable: { $ne: false } } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const availablePosts = posts.filter((post) => Boolean(post.author));

        const totalPages = Math.max(Math.ceil(totalPosts / limit), 1);

        return res
        .status(200)
        .json({
            message : 'posts loaded successfully',
            posts: availablePosts,
            pagination: {
                page,
                limit,
                totalPosts,
                totalPages,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages
            }
        })

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : 'error while getting posts'});
    }
}