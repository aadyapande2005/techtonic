import { useEffect, useState } from 'react'
import { useLoaderData, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import type { PostData } from '../interfaces/postInterface';

interface PaginationData {
  page: number
  limit: number
  totalResults: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

interface SimilarSearchLoaderData {
  posts: PostData[]
  liked_posts: string[]
  saved_posts: string[]
  pagination: PaginationData
  query: string
}

function SimilarSearchResultsPage() {
  const navigate = useNavigate()
  const { search_query } = useParams<{ search_query: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [decodedQuery, setDecodedQuery] = useState('')

  const { posts, liked_posts, saved_posts, pagination, query } = useLoaderData() as SimilarSearchLoaderData

  useEffect(() => {
    if (search_query) {
      const decoded = decodeURIComponent(search_query)
      setDecodedQuery(decoded)
    }
  }, [search_query])

  const currentPage = pagination?.page || Number(searchParams.get('page') || 1) || 1

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > (pagination?.totalPages || 1)) return
    const nextParams: Record<string, string> = { page: String(newPage) }
    setSearchParams(nextParams)
  }

  const handleNewSearch = () => {
    navigate('/')
  }

  return (
    <>
      <section className='mx-auto w-full max-w-7xl px-4 pb-10 pt-4'>
        <div className='rise-in mb-6 rounded-3xl border border-blue-200/70 bg-blue-50/90 px-6 py-5 shadow-xl shadow-blue-900/10'>
          <h2 className='display-title text-3xl font-semibold text-blue-950 md:text-4xl'>Showing results for: <span className='font-semibold text-blue-900'>"{decodedQuery || query}"</span></h2>
          
          <div className='mt-4 flex flex-wrap items-center gap-3'>
            <button
              className='pressable cursor-pointer rounded-full border border-blue-300 bg-blue-50/90 px-4 py-2 text-blue-900'
              onClick={handleNewSearch}
            >
              New Search
            </button>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className='text-center py-12'>
            <div className='mx-auto mb-4 rounded-full bg-blue-100 p-4 text-blue-600'>
              <svg className='w-12 h-12' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-blue-900'>No similar posts found</h3>
            <p className='mt-2 text-blue-700'>Try a different search query or browse the latest posts below.</p>
            <button
              className='mt-4 pressable cursor-pointer rounded-full bg-blue-900 px-6 py-2 text-blue-50'
              onClick={handleNewSearch}
            >
              Back to Home
            </button>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  _id={post._id}
                  author={post.author.username}
                  authorId={post.author._id}
                  title={post.title}
                  description={post.description}
                  likes={post.likes}
                  topics={post.topics || []}
                  isLiked={liked_posts.includes(post._id)}
                  isSaved={saved_posts.includes(post._id)}
                  onOpenPost={() => navigate(`/post/${post._id}`)}
                />
              ))}
            </div>

            <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
              <button
                className='pressable cursor-pointer rounded-full border border-blue-300 bg-blue-50/90 px-4 py-2 text-blue-900 disabled:cursor-not-allowed disabled:opacity-50'
                onClick={() => changePage(currentPage - 1)}
                disabled={!pagination?.hasPrevPage}
              >
                Previous
              </button>

              <div className='rounded-full border border-blue-300 bg-blue-50/90 px-4 py-2 text-sm text-blue-900'>
                Page {currentPage} of {pagination?.totalPages || 1}
              </div>

              <button
                className='pressable cursor-pointer rounded-full border border-blue-300 bg-blue-50/90 px-4 py-2 text-blue-900 disabled:cursor-not-allowed disabled:opacity-50'
                onClick={() => changePage(currentPage + 1)}
                disabled={!pagination?.hasNextPage}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </>
  )
}

export default SimilarSearchResultsPage