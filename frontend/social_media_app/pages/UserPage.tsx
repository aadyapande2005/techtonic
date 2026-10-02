import { useAuth } from "../context/authContext"
import PostCard from '../components/PostCard'
import { useLoaderData, useNavigate } from "react-router-dom";
import type { PostData } from "../interfaces/postInterface";
import { apiRequest } from "../lib/apiRequest";
import { useEffect, useState } from "react";


function UserPage() {
  const auth = useAuth() as { user?: { _id?: string, username?: string }, setUser?: (user: null) => void } | null
  const user = auth?.user
  const navigate = useNavigate()

  const {posts} = useLoaderData() as { posts: PostData[] }
  const [userPosts, setUserPosts] = useState<PostData[]>(posts)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false)

  useEffect(() => {
    setUserPosts(posts)
  }, [posts])

  const handleDeletePost = async (postId: string) => {
    const shouldDelete = window.confirm('Delete this post? It will be marked unavailable.')

    if (!shouldDelete) {
      return
    }

    try {
      setDeletingPostId(postId)
      await apiRequest.delete(`/post/deletepost/${postId}`)
      setUserPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId))
    } catch (error: any) {
      console.log(error?.response?.data || error)
      alert(error?.response?.data?.message || 'Unable to delete post')
    } finally {
      setDeletingPostId(null)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user?._id) {
      return
    }

    const shouldDelete = window.confirm('Delete account? Your account and authored posts will be marked unavailable.')

    if (!shouldDelete) {
      return
    }

    try {
      setIsDeletingAccount(true)
      await apiRequest.delete(`/user/${user._id}`)
      auth?.setUser?.(null)
      navigate('/login')
    } catch (error: any) {
      console.log(error?.response?.data || error)
      alert(error?.response?.data?.message || 'Unable to delete account')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-10 pt-5">
      <div className="rise-in rounded-3xl border border-amber-200/70 bg-amber-50/90 p-4 shadow-2xl shadow-amber-900/15 md:p-6">
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-amber-200 bg-linear-to-r from-orange-100 to-amber-200 p-4 shadow-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-200 bg-orange-100 text-3xl font-bold text-amber-900 shadow-md">
            {(user?.username || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-700">Your Tech Desk</p>
            <h1 className="display-title text-3xl text-amber-950">{user?.username || 'User'}</h1>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="pressable rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100"
              onClick={() => navigate('/saved')}
            >
              View saved posts
            </button>

            <button
              type="button"
              className="pressable rounded-2xl border border-red-300 bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 shadow-sm transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? 'Deleting account...' : 'Delete account'}
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {userPosts.map((post) => (
            <div key={post._id} className="flex flex-col gap-3">
              <PostCard
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

              <button
                type="button"
                className="pressable rounded-2xl border border-red-300 bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 shadow-sm transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleDeletePost(post._id)}
                disabled={deletingPostId === post._id}
              >
                {deletingPostId === post._id ? 'Deleting post...' : 'Delete post'}
              </button>
            </div>
          ))}
        </div>

        {userPosts.length === 0 && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-orange-50 px-5 py-8 text-center text-amber-800">
            You have not published any tech blog yet.
          </div>
        )}
      </div>
    </section>
  )
}

export default UserPage