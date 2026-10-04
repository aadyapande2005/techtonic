import Post from "../../models/posts.model.js";
import { triggerRelatedPostsRefresh } from "../../services/relatedPosts.service.js";
import { getCacheTTLMs } from "../../config/relatedPosts.config.js";

export const getpost = async (req, res) => {
    try {
        const postid = req.params.postid;

        const findpost = await Post.findOne({ _id: postid, isAvailable: { $ne: false } })
            .populate({ path: 'author', select: 'username email', match: { isAvailable: { $ne: false } } })
            .populate({
                path: 'relatedPosts.posts.postId',
                match: { isAvailable: { $ne: false } },
                populate: {
                    path: 'author',
                    select: 'username email isAvailable',
                    match: { isAvailable: { $ne: false } }
                }
            });

        if(!findpost || !findpost.author) {
            return res
            .status(403)
            .json({message : 'this post doesn\'t exist'});
        }

        const postObj: any = findpost.toObject();

        // Filter out any populated posts where postId is null (e.g. deleted or unavailable)
        const validRelatedPosts = (postObj.relatedPosts?.posts || []).filter(
            (item: any) => Boolean(item.postId && item.postId.author)
        );

        if (postObj.relatedPosts) {
            postObj.relatedPosts.posts = validRelatedPosts;
        }

        const updatedAt = postObj.relatedPosts?.updatedAt;
        const cacheAge = updatedAt ? (Date.now() - new Date(updatedAt).getTime()) : Infinity;
        const isCacheExpired = !updatedAt || cacheAge > getCacheTTLMs();
        const isCacheEmpty = !validRelatedPosts || validRelatedPosts.length === 0;

        // If the cache has expired or cache is empty, trigger a background worker to refresh the post's latest related posts.
        if (isCacheExpired || isCacheEmpty) {
            void triggerRelatedPostsRefresh(postid);
        }

        // If related posts are filled, return the cached data (even if expired).
        // If related posts are empty, findpost.relatedPosts.posts will be []
        return res
        .status(200)
        .json({message : `posts with id ${postid} loaded successfully`, findpost: postObj});

    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({message : `error while getting post`});
    }
}