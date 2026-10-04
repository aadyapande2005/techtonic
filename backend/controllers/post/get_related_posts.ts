import Post from "../../models/posts.model.js";

/**
 * Controller to fetch related posts directly from the database without triggering any background job.
 * Used by the frontend 'Get Related Posts' button to poll/read populated related posts.
 */
export const get_related_posts = async (req, res) => {
    try {
        const postid = req.params.postid;

        if (!postid) {
            return res.status(400).json({ message: 'Post id is required' });
        }

        const post = await Post.findOne({ _id: postid, isAvailable: { $ne: false } })
            .populate({
                path: 'relatedPosts.posts.postId',
                match: { isAvailable: { $ne: false } },
                populate: {
                    path: 'author',
                    select: 'username email isAvailable',
                    match: { isAvailable: { $ne: false } }
                }
            });

        if (!post) {
            return res.status(404).json({ message: 'Post not found or unavailable' });
        }

        const postObj: any = post.toObject();

        // Filter out any populated posts that might be null (due to match condition)
        const validRelatedPosts = (postObj.relatedPosts?.posts || []).filter(
            (item: any) => Boolean(item.postId && item.postId.author)
        );

        return res.status(200).json({
            message: 'Related posts fetched successfully',
            relatedPosts: validRelatedPosts,
            updatedAt: postObj.relatedPosts?.updatedAt || null
        });
    } catch (error) {
        console.error('Error fetching related posts:', error);
        return res.status(500).json({
            message: 'Error fetching related posts'
        });
    }
};
