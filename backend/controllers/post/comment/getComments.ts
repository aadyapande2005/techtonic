import Comment from "../../../models/comment.model.js";
import Post from "../../../models/posts.model.js";

const COMMENTS_PER_PAGE = 10;

export const getComments = async (req, res) => {
    try {
        const postid = req.params.postid;
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = COMMENTS_PER_PAGE;
        const skip = (page - 1) * limit;

        const post = await Post.findOne({ _id: postid, isAvailable: { $ne: false } }, '_id');
        if (!post) return res.status(404).json({ message: 'post not found' });

        const totalComments = await Comment.countDocuments({ postId: postid });
        const comments = await Comment.find({ postId: postid })
            .populate({ path: 'userId', select: 'username email', match: { isAvailable: { $ne: false } } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.max(Math.ceil(totalComments / limit), 1);
        return res.status(200).json({
            message: 'comments loaded successfully',
            comments: comments.filter((comment) => Boolean(comment.userId)),
            pagination: {
                page,
                limit,
                totalComments,
                totalPages,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error while getting comments' });
    }
};