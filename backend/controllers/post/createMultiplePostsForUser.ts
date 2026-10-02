import User from "../../models/user.model.js";
import Post from "../../models/posts.model.js";

export const createMultiplePostsForUser = async ({ username, posts }) => {
    try {
        const user = await User.findOne({ username, isAvailable: { $ne: false } });
        if (!user) throw new Error(`User ${username} not found`);

        const created = [];

        for (const p of posts) {
            const newpost = await Post.create({
                title: p.title,
                summary: String(p.summary || '').trim(),
                description: p.description,
                caption: p.caption || '',
                author: user._id,
                topics: Array.isArray(p.topics) ? p.topics : (String(p.topics || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean))
            });
            created.push(newpost);
        }

        await User.findByIdAndUpdate(user._id, { $addToSet: { posts: { $each: created.map(c => c._id) } } });

        return { username, createdCount: created.length };
    } catch (err) {
        console.error(err);
        throw err;
    }
};