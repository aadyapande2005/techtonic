import User from "../../models/user.model";
import QdrantService from "../../recommendation_engine/vectors/qdrant.service.js";


const getrecommedposts = async (req, res) => {

    try {
        
        const userid = req.user.id;

        const user_qdrantid = await User.findById(userid).select('qdrantId');

        const user_qdrant = await QdrantService.retrieve("users", user_qdrantid);

        const user_vector = user_qdrant.vector;

        const recommended_posts = await QdrantService.search("posts", user_vector, {
            limit: 10
        });

        return res.status(200).json({
            success: true,
            message: "recommended posts fetched successfully",
            data: recommended_posts
        });


    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: "error while fetching recommended posts",
            error: error.message
        });
    }

}

export default getrecommedposts;