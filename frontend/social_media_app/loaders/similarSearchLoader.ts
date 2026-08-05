import { apiRequest } from '../lib/apiRequest'

type LikedPost = string | { _id?: string }

const getSimilarPosts = async ({ request, params }: { request: Request, params: { search_query: string } }) => {
    try {
        const url = new URL(request.url)
        const page = Number(url.searchParams.get('page') || '1')
        const safePage = Number.isNaN(page) || page < 1 ? 1 : page
        const limit = 10

        const searchQuery = params.search_query

        let posts
        let pagination
        try {
            const endpoint = `/post/similar/${searchQuery}?page=${safePage}&limit=${limit}`

            const response = await apiRequest.get(endpoint)
            
            posts = response.data.posts
            pagination = response.data.pagination
        
    
        } catch (error: any) {
            console.log(error?.response.data)
            return {
                posts: [],
                liked_posts: [],
                saved_posts: [],
                query: searchQuery,
                pagination: {
                    page: safePage,
                    limit,
                    totalResults: 0,
                    totalPages: 1,
                    hasPrevPage: false,
                    hasNextPage: false
                }
            }
        }
    
        try {
            await apiRequest.get('/auth/islogin');

            const likedPostsResponse = await apiRequest.get('user/post/liked')
            const savedPostsResponse = await apiRequest.get('user/post/saved')

            const liked_posts = (likedPostsResponse.data?.liked_posts?.likes || [])
                .map((post: LikedPost) => {
                    if (typeof post === 'string') return post
                    return post?._id || ''
                })
                .filter((postId: string) => Boolean(postId))

            const saved_posts = (savedPostsResponse.data?.saved_posts?.savedPosts || [])
                .map((post: LikedPost) => {
                    if (typeof post === 'string') return post
                    return post?._id || ''
                })
                .filter((postId: string) => Boolean(postId))
    
            return {posts, liked_posts, saved_posts, pagination, query: searchQuery}
    
        } catch (error: any) {
            console.log(error?.response.data)
            return { posts, liked_posts: [], saved_posts: [], pagination, query: searchQuery }
        }
    } catch (error) {
        console.log(error)
        return {
            posts: [],
            liked_posts: [],
            saved_posts: [],
            query: params.search_query,
            pagination: {
                page: 1,
                limit: 10,
                totalResults: 0,
                totalPages: 1,
                hasPrevPage: false,
                hasNextPage: false
            }
        }
    }
}

export default getSimilarPosts;