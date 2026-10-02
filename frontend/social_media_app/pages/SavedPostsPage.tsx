import { useLoaderData, useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard'
import type { PostData } from '../interfaces/postInterface'

function SavedPostsPage() {
  const navigate = useNavigate()
  const { savedPosts } = useLoaderData() as { savedPosts: PostData[] }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-10 pt-5">
      <div className="rise-in rounded-3xl border border-amber-200/70 bg-amber-50/90 p-4 shadow-2xl shadow-amber-900/15 md:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-linear-to-r from-orange-100 to-amber-200 p-4 shadow-md">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-700">Your Collection</p>
            <h1 className="display-title text-3xl text-amber-950">Saved Posts</h1>
          </div>

          <button
            type="button"
            className="pressable cursor-pointer rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-amber-900"
            onClick={() => navigate('/profile')}
          >
            Back to profile
          </button>
        </div>

        {savedPosts.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-orange-50 px-5 py-8 text-center text-amber-800">
            You have not saved any posts yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {savedPosts.map((post) => (
              <PostCard
                key={post._id}
                _id={post._id}
                author={post.author?.username || 'Unavailable User'}
                authorId={post.author?._id || ''}
                title={post.title}
                description={post.description}
                caption={post.caption}
                likesCount={post.likesCount}
                topics={post.topics || []}
                onOpenPost={() => navigate(`/post/${post._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default SavedPostsPage
