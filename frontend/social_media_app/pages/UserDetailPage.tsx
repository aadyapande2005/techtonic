import { useLoaderData, useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard'
import type { PostData } from '../interfaces/postInterface'

interface LoadedUser {
  _id?: string
  username?: string
  email?: string
}

function UserDetailPage() {
  const navigate = useNavigate()
  const { user, posts } = useLoaderData() as { user: LoadedUser | null, posts: PostData[] }

  if (!user) {
    return (
      <div className="mx-auto mt-10 w-full max-w-4xl px-4">
        <div className="rise-in rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700 shadow-xl">
          User not found.
        </div>
      </div>
    )
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-10 pt-5">
      <div className="rise-in rounded-3xl border border-amber-200/70 bg-amber-50/90 p-4 shadow-2xl shadow-amber-900/15 md:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-linear-to-r from-orange-100 to-amber-200 p-4 shadow-md">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-700">Creator Space</p>
            <h1 className="display-title text-3xl text-amber-950">{user.username || 'Unknown User'}</h1>
            <p className="mt-1 text-sm text-amber-800">Posts published: {posts.length}</p>
          </div>

          <button
            type="button"
            className="pressable cursor-pointer rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-amber-900"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-orange-50 px-5 py-8 text-center text-amber-800">
            This user has no available posts.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
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

export default UserDetailPage
