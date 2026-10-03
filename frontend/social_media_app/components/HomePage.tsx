import { useEffect, useState } from 'react'
import PostCard from './PostCard'
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import type { PostData } from '../interfaces/postInterface';
import { apiRequest } from '../lib/apiRequest';

interface PaginationData {
  page: number
  limit: number
  totalPosts: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}


function HomePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [smartSearchQuery, setSmartSearchQuery] = useState('')
  const [loadedPosts, setLoadedPosts] = useState<PostData[]>([])
  const [loadedPagination, setLoadedPagination] = useState<PaginationData | undefined>()
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const {posts: initialPosts, pagination: initialPagination} = useLoaderData() as {
    posts: PostData[]
    liked_posts: string[]
    saved_posts: string[]
    pagination: PaginationData
    topic?: string
  };

  const currentTopic = (searchParams.get('topic') || '').trim().toLowerCase()
  const posts = loadedPosts.length > 0 || initialPosts.length === 0 ? loadedPosts : initialPosts
  const pagination = loadedPagination || initialPagination

  const currentPage = pagination?.page || Number(searchParams.get('page') || 1) || 1

  useEffect(() => {
    setLoadedPosts(initialPosts)
    setLoadedPagination(initialPagination)
    setLoadError('')
  }, [initialPosts, initialPagination, currentTopic])

  useEffect(() => {
    const sentinel = document.getElementById('home-feed-sentinel')
    if (!sentinel || isLoadingMore || !pagination?.hasNextPage) return

    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || isLoadingMore) return

      setIsLoadingMore(true)
      setLoadError('')

      try {
        const nextPage = currentPage + 1
        const endpoint = currentTopic
          ? `/post/topic/${encodeURIComponent(currentTopic)}?page=${nextPage}&limit=9`
          : `/post?page=${nextPage}&limit=9`
        const response = await apiRequest.get(endpoint)

        setLoadedPosts((currentPosts) => [...currentPosts, ...(response.data.posts || [])])
        setLoadedPagination(response.data.pagination)
      } catch {
        setLoadError('Unable to load more posts.')
      } finally {
        setIsLoadingMore(false)
      }
    }, { rootMargin: '0px 0px 400px' })

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [currentPage, currentTopic, isLoadingMore, pagination?.hasNextPage, retryCount])

  const handleSmartSearch = () => {
    const query = smartSearchQuery.trim()
    if (!query) return
    // Navigate to similarity search results page
    navigate(`/search/similar/${encodeURIComponent(query)}`)
  }
  
  return (
    <>
      <section className='mx-auto w-full max-w-7xl px-4 pb-10 pt-4'>
        <div className='rise-in mb-6 rounded-3xl border border-amber-200/70 bg-amber-50/90 px-6 py-5 shadow-xl shadow-amber-900/10'>
          <h2 className='display-title text-3xl font-semibold text-amber-950 md:text-4xl'>Latest Tech Blogs</h2>
          <p className='mt-1 text-amber-800'>Deep dives, practical notes, and engineering ideas from the community.</p>

          <div className='mt-4 flex flex-wrap items-center gap-3'>
            <input
              type='text'
              value={smartSearchQuery}
              onChange={(event) => setSmartSearchQuery(event.target.value)}
              placeholder='Filter by topic (e.g. react, nodejs, ai)'
              className='w-full max-w-md rounded-2xl border border-amber-300 bg-white px-4 py-2 text-amber-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200'
            />
            <button
              className='pressable cursor-pointer rounded-full bg-amber-900 px-4 py-2 text-amber-50'
              onClick={handleSmartSearch}
              disabled={!smartSearchQuery.trim()}
            >
              Search Topic
            </button>
            {/* <button
              className='pressable cursor-pointer rounded-full border border-amber-300 bg-amber-50/90 px-4 py-2 text-amber-900'
              onClick={clearTopicFilter}
            >
              Clear
            </button> */}
          </div>

          {currentTopic && (
            <p className='mt-3 text-sm text-amber-800'>Showing topic: <span className='rounded-full bg-orange-100 px-2 py-1 font-semibold'>{currentTopic}</span></p>
          )}
        </div>

        {/* Smart Search Section */}
        {/* <div className='rise-in mb-6 rounded-3xl border border-blue-200/70 bg-blue-50/90 px-6 py-5 shadow-xl shadow-blue-900/10'>
          <h3 className='text-2xl font-semibold text-blue-950'>Smart Search (AI-Powered)</h3>
          <p className='mt-1 text-blue-800'>Find posts by semantic meaning, not just keywords. Results with less than 50% similarity are filtered out.</p>
          
          <div className='mt-4 flex flex-wrap items-center gap-3'>
            <input
              type='text'
              value={smartSearchQuery}
              onChange={(event) => setSmartSearchQuery(event.target.value)}
              onKeyDown={handleSmartSearchKeyDown}
              placeholder='Search by meaning (e.g. "how to optimize react performance", "best practices for nodejs authentication")'
              className='w-full max-w-2xl rounded-2xl border border-blue-300 bg-white px-4 py-2 text-blue-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200'
            />
            <button
              className='pressable cursor-pointer rounded-full bg-blue-900 px-4 py-2 text-blue-50'
              onClick={handleSmartSearch}
              disabled={!smartSearchQuery.trim()}
            >
              Smart Search
            </button>
          </div>
        </div> */}

      <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
        {posts.map((post) => (          
          <PostCard 
            key={post._id}
            _id={post._id}
            author={post.author.username} 
            authorId={post.author._id}
            title={post.title} 
            description={post.description} 
            caption={post.caption}
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            viewsCount={post.viewsCount}
            topics={post.topics || []}
            onOpenPost={() => navigate(`/post/${post._id}`)}
          />
        ))}
      </div>

      <div id='home-feed-sentinel' className='mt-8 flex min-h-12 items-center justify-center text-sm text-amber-800' aria-live='polite'>
        {isLoadingMore && <span>Loading more posts...</span>}
        {!isLoadingMore && loadError && (
          <button className='pressable cursor-pointer rounded-full border border-amber-300 bg-amber-50/90 px-4 py-2 text-amber-900' onClick={() => setRetryCount((count) => count + 1)}>
            {loadError} Try again
          </button>
        )}
        {!isLoadingMore && !loadError && !pagination?.hasNextPage && posts.length > 0 && <span>You have reached the end.</span>}
      </div>
      </section>
    </>
  )
}

export default HomePage