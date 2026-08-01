import Post from "../models/posts.model.js";
import User from "../models/user.model.js";
import { postQueue } from "../queues/post.queue.js";
import { profileQueue } from "../queues/profile.queue.js";

const sanitizeTopics = (topics) => {
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

const buildTopicSearchRegex = (query) => {
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

export const getpost = async (req, res) => {
    try {
        const postid = req.params.postid;

        const findpost = await Post.findOne({ _id: postid, isAvailable: { $ne: false } })
            .populate({ path: 'author', select: 'username email', match: { isAvailable: { $ne: false } } });

        if(!findpost || !findpost.author) {
            return res
            .status(403)
            .json({message : 'this post doesn\'t exist'});
        }

        return res
        .status(200)
        .json({message : `posts with id ${postid} loaded successfully`, findpost});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while getting post`});
    }
}

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

export const generatepost = async (req, res) => {
    try {
        const userid = req.user.id;

        const {title, description, topics} = req.body;
        const normalizedTopics = sanitizeTopics(topics);

        if(!title || !description) {
            return res
            .status(400)
            .json({message : 'both title and description are needed for creating a post'});
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
            description,
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

export const likepost = async (req, res) => {
    try {
        const userid = req.user.id;
        const postid = req.params.postid;

        const liked_post = await Post.findOneAndUpdate(
            { _id: postid, isAvailable: { $ne: false } },
            { $addToSet: { likes: userid } },
            { new: true }
        );

        if(!liked_post) {
            return res
            .status(404)
            .json({message : 'post not found or unavailable'});
        }

        const likeByUser = await User.findOneAndUpdate(
            { _id: userid, isAvailable: { $ne: false } },
            { $addToSet: { likes: postid } },
            { new: true }
        );

        if(!likeByUser) {
            await Post.findByIdAndUpdate(postid, { $pull: { likes: userid } });
            return res
            .status(404)
            .json({message : 'user not found or unavailable'});
        }

        await profileQueue.add(
            'profile-update', 
            { 
                user : {
                    id: userid,
                    qdrantId: likeByUser.qdrantId,
                },
                post: liked_post 
            }, 
            { jobId: `${userid}-${postid}` }
        );

        return res
        .status(200)
        .json({message : `post liked successfully by user with id ${userid}`, liked_post});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while liking post`});
    }
}

export const unlikepost = async (req, res) => {
    try {
        const userid = req.user.id;
        const postid = req.params.postid;

        const liked_post = await Post.findOneAndUpdate(
            { _id: postid, isAvailable: { $ne: false } },
            { $pull: { likes: userid } },
            { new: true }
        );

        if(!liked_post) {
            return res
            .status(404)
            .json({message : 'post not found or unavailable'});
        }
        
        const user_liked_post = await User.findOneAndUpdate(
            { _id: userid, isAvailable: { $ne: false } },
            { $pull: { likes: postid } },
            { new: true }
        );

        if(!user_liked_post) {
            return res
            .status(404)
            .json({message : 'user not found or unavailable'});
        }

        return res
        .status(200)
        .json({message : `post unliked successfully by user with id ${userid}`, liked_post});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while liking post`});
    }
}

export const savepost = async (req, res) => {
    try {
        const userid = req.user.id;
        const postid = req.params.postid;

        const postToSave = await Post.findOne({ _id: postid, isAvailable: { $ne: false } });

        if(!postToSave) {
            return res
            .status(404)
            .json({message : 'post not found or unavailable'});
        }

        const savedByUser = await User.findOneAndUpdate(
            { _id: userid, isAvailable: { $ne: false } },
            { $addToSet: { savedPosts: postid } },
            { new: true }
        );

        if(!savedByUser) {
            return res
            .status(404)
            .json({message : 'user not found or unavailable'});
        }

        return res
        .status(200)
        .json({message : `post saved successfully by user with id ${userid}`});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while saving post`});
    }
}

export const unsavepost = async (req, res) => {
    try {
        const userid = req.user.id;
        const postid = req.params.postid;

        const postToUnsave = await Post.findOne({ _id: postid, isAvailable: { $ne: false } });

        if(!postToUnsave) {
            return res
            .status(404)
            .json({message : 'post not found or unavailable'});
        }

        const unsavedByUser = await User.findOneAndUpdate(
            { _id: userid, isAvailable: { $ne: false } },
            { $pull: { savedPosts: postid } },
            { new: true }
        );

        if(!unsavedByUser) {
            return res
            .status(404)
            .json({message : 'user not found or unavailable'});
        }

        return res
        .status(200)
        .json({message : `post unsaved successfully by user with id ${userid}`});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while unsaving post`});
    }
}

export const deletepost = async (req, res) => {
    try {
        const postid = req.params.postid;
        const userid = req.user.id;

        const deletedpost = await Post.findOneAndUpdate(
            { _id: postid, author: userid, isAvailable: { $ne: false } },
            { isAvailable: false },
            { new: true }
        );

        // console.log(deletedpost);

        if(!deletedpost) {
            return res
            .status(404)
            .json({message : 'post not found'});
        }

        return res
        .status(200)
        .json({message : `post with id ${postid} marked unavailable successfully`});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while deleting post`});
    }
}

export const getlikes = async (req, res) => {
    try {
        const postid = req.params.postid;
        const post = await Post.findOne({ _id: postid, isAvailable: { $ne: false } }, 'likes')
            .populate({ path: 'likes', select: 'username', match: { isAvailable: { $ne: false } } });

        if(!post) {
            return res
            .status(400)
            .json({message:'post not found'});
        }

        return res
        .status(200)
        .json({message:'all likes for post sent', post});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while getting likes`});
    }
}