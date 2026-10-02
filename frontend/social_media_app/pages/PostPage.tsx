
import { Bookmark, Eye, Heart, MessageCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { JSONContent } from '@tiptap/core'
import { Image } from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { Highlight } from '@tiptap/extension-highlight'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { renderToReactElement } from '@tiptap/static-renderer/pm/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Selection } from '@tiptap/extensions'
import { apiRequest } from '../lib/apiRequest'
import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'

const postContentExtensions = [
  StarterKit.configure({
    horizontalRule: false,
    link: {
      openOnClick: false,
      enableClickSelection: true,
    },
  }),
  HorizontalRule,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight.configure({ multicolor: true }),
  Image,
  Typography,
  Superscript,
  Subscript,
  Selection,
]

const getPostDocument = (description: unknown): JSONContent | null => {
  if (description && typeof description === 'object') {
    const content = description as { json?: unknown }
    if (content.json && typeof content.json === 'object') {
      return content.json as JSONContent
    }
    return description as JSONContent
  }

  if (typeof description === 'string') {
    try {
      const parsed = JSON.parse(description) as { json?: unknown }
      if (parsed && typeof parsed === 'object' && parsed.json && typeof parsed.json === 'object') {
        return parsed.json as JSONContent
      }
      if (parsed && typeof parsed === 'object' && 'type' in parsed) {
        return parsed as JSONContent
      }
    } catch {
      return {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: description }] }],
      }
    }
  }

  return null
}

type PostRef = string | { _id?: string }

interface DetailedPost {
  _id: string
  title: string
  description: unknown
  caption?: string
  likesCount: number
  commentsCount: number
  viewsCount: number
  topics?: string[]
  author?: {
    _id?: string
    username?: string
    email?: string
  }
  createdAt?: string
}

interface CommentData {
  _id: string
  content: string
  createdAt: string
  userId: { username?: string }
}

interface CommentPagination {
  page: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

function PostPage() {
  const { postid } = useParams()
  const navigate = useNavigate()

  const [post, setPost] = useState<DetailedPost | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLiking, setIsLiking] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [comments, setComments] = useState<CommentData[]>([])
  const [commentPage, setCommentPage] = useState(1)
  const [commentPagination, setCommentPagination] = useState<CommentPagination | null>(null)
  const [commentContent, setCommentContent] = useState('')
  const [commentError, setCommentError] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      if (!postid) {
        setError('Post id is missing.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        try {
          await apiRequest.get('/auth/islogin')
          const likedPostsRes = await apiRequest.get('/user/post/liked')
          const likedPostIds = (likedPostsRes.data?.liked_posts?.likes || [])
            .map((likedPost: PostRef) => typeof likedPost === 'string' ? likedPost : likedPost?._id || '')
            .filter((likedPostId: string) => Boolean(likedPostId))
          setIsLiked(likedPostIds.includes(postid))

          const savedPostsRes = await apiRequest.get('/user/post/saved')
          const savedPostIds = (savedPostsRes.data?.saved_posts?.savedPosts || [])
            .map((post: PostRef) => {
              if (typeof post === 'string') return post
              return post?._id || ''
            })
            .filter((postId: string) => Boolean(postId))

          setIsSaved(savedPostIds.includes(postid))
        } catch {
          setIsLiked(false)
          setIsSaved(false)
        }

        const response = await apiRequest.get(`/post/getpost/${postid}`)
        setPost(response.data.findpost)
        const commentsResponse = await apiRequest.get(`/post/${postid}/comments?page=1`)
        setComments(commentsResponse.data.comments || [])
        setCommentPagination(commentsResponse.data.pagination || null)
      } catch (err: any) {
        const message = err?.response?.data?.message || 'Unable to load this post.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [postid])

  useEffect(() => {
    if (!postid) return

    const startedAt = Date.now()
    let viewRecorded = false
    const recordView = async () => {
      if (viewRecorded) return
      const viewingTime = Math.floor((Date.now() - startedAt) / 1000)
      if (viewingTime <= 60) return
      viewRecorded = true
      try {
        await apiRequest.post(`/post/${postid}/view`, { viewingTime })
      } catch {
        viewRecorded = false
      }
    }

    const timer = window.setTimeout(recordView, 61_000)
    return () => {
      window.clearTimeout(timer)
      void recordView()
    }
  }, [postid])

  const loadComments = async (page: number) => {
    if (!postid) return
    const response = await apiRequest.get(`/post/${postid}/comments?page=${page}`)
    setComments(response.data.comments || [])
    setCommentPagination(response.data.pagination || null)
    setCommentPage(page)
  }

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isCommenting) return
    if (!postid) {
      setCommentError('This post is unavailable.')
      return
    }
    if (!commentContent.trim()) {
      setCommentError('Write a comment before posting.')
      return
    }

    try {
      setIsCommenting(true)
      setCommentError('')
      await apiRequest.post(`/post/${postid}/comments`, { content: commentContent.trim() })
      setCommentContent('')
      const refreshed = await apiRequest.get(`/post/getpost/${postid}`)
      setPost(refreshed.data.findpost)
      await loadComments(1)
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setCommentError('Please login to comment on posts.')
      } else {
        setCommentError(err?.response?.data?.message || 'Unable to post your comment.')
      }
    } finally {
      setIsCommenting(false)
    }
  }

  const handleLikeToggle = async () => {
    if (!post || !postid || isLiking) return

    try {
      setIsLiking(true)

      const endpoint = isLiked ? `/post/unlike/${postid}` : `/post/like/${postid}`

      await apiRequest.get(endpoint)

      const refreshed = await apiRequest.get(`/post/getpost/${postid}`)
      setPost(refreshed.data.findpost)
      setIsLiked((prev) => !prev)
    } catch (err: any) {
      if (err?.response?.status === 401) {
        alert('Please login to like posts.')
      }
    } finally {
      setIsLiking(false)
    }
  }

  const handleSaveToggle = async () => {
    if (!postid || isSaving) return

    try {
      setIsSaving(true)

      const endpoint = isSaved ? `/post/unsave/${postid}` : `/post/save/${postid}`
      await apiRequest.get(endpoint)

      setIsSaved((prev) => !prev)
    } catch (err: any) {
      if (err?.response?.status === 401) {
        alert('Please login to save posts.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const postDocument = useMemo(
    () => (post ? getPostDocument(post.description) : null),
    [post?.description]
  )
  const renderedPostContent = useMemo(() => {
    if (!postDocument) return null

    return renderToReactElement({
      extensions: postContentExtensions,
      content: postDocument,
    })
  }, [postDocument])

  if (isLoading) {
    return (
      <div className="mx-auto mt-10 w-full max-w-4xl px-4">
        <div className="rise-in rounded-3xl border border-amber-200 bg-amber-50/90 px-6 py-10 text-center text-amber-900 shadow-xl">
          Loading post...
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="mx-auto mt-10 w-full max-w-4xl px-4">
        <div className="rise-in rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700 shadow-xl">
          {error || 'Post not found.'}
        </div>
      </div>
    )
  }

  const postDate = post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Unknown date'

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-10 pt-5">
      <div className="rise-in overflow-hidden rounded-3xl border border-amber-200/80 bg-amber-50/90 shadow-2xl shadow-amber-900/15">
        <div className="border-b border-amber-200 bg-linear-to-r from-orange-100 to-amber-200 px-6 py-6">
          <h1 className="display-title text-4xl text-amber-950">{post.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-amber-900">
            <button
              type="button"
              className="rounded-full bg-amber-900 px-3 py-1 text-amber-50"
              onClick={() => {
                if (post.author?._id) {
                  navigate(`/user/${post.author._id}`)
                }
              }}
              disabled={!post.author?._id}
            >
              {post.author?.username || 'Unknown author'}
            </button>
            <span className="rounded-full border border-amber-300 bg-amber-50/80 px-3 py-1">{postDate}</span>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          {!!post.topics?.length && (
            <div className="flex flex-wrap gap-2">
              {post.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-orange-200 bg-orange-100 px-3 py-1 text-sm font-semibold text-amber-900"
                >
                  #{topic}
                </span>
              ))}
            </div>
          )}

          {/* {post.caption && (
            <div className="rounded-2xl bg-amber-100/50 p-4 border border-amber-200 mb-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">Caption</p>
              <p className="text-amber-900">{post.caption}</p>
            </div>
          )} */}

          <div className="tiptap-rendered-content rounded-2xl border border-amber-200 bg-orange-50 p-5 text-lg leading-8 text-amber-900">
            {renderedPostContent || 'This post has no content.'}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-200 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="pressable flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleLikeToggle}
                disabled={isLiking}
              >
                <Heart className="text-orange-500" fill="currentColor" />
                <span>{post.likesCount || 0} likes</span>
              </button>

              <span className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-amber-900">
                <MessageCircle />
                <span>{post.commentsCount || 0} comments</span>
              </span>

              <span className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-amber-900">
                <Eye />
                <span>{post.viewsCount || 0} reads</span>
              </span>

              <button
                className="pressable flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSaveToggle}
                disabled={isSaving}
              >
                {isSaved ? <Bookmark className="text-amber-800" fill="currentColor" /> : <Bookmark className="text-amber-800" />}
                <span>{isSaved ? 'Saved' : 'Save post'}</span>
              </button>
            </div>

            <button
              className="pressable cursor-pointer rounded-full border border-amber-300 bg-amber-50 px-5 py-2 text-amber-900"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>

          <section className="border-t border-amber-200 pt-5" aria-labelledby="comments-heading">
            <h2 id="comments-heading" className="display-title text-2xl text-amber-950">Comments</h2>
            <form className="mt-4 flex flex-col gap-3" onSubmit={handleCommentSubmit}>
              <textarea
                value={commentContent}
                onChange={(event) => {
                  setCommentContent(event.target.value)
                  if (commentError) setCommentError('')
                }}
                maxLength={2000}
                placeholder="Share your thoughts"
                className="min-h-24 rounded-2xl border border-amber-300 bg-white p-3 text-amber-950 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              />
              {commentError && <p className="text-sm text-red-700" role="alert">{commentError}</p>}
              <button
                type="submit"
                disabled={isCommenting}
                className="pressable w-fit rounded-full bg-amber-900 px-4 py-2 text-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCommenting ? 'Posting...' : 'Post comment'}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {comments.length === 0 ? (
                <p className="text-amber-800">No comments yet.</p>
              ) : comments.map((comment) => (
                <article key={comment._id} className="rounded-2xl border border-amber-200 bg-orange-50 p-4">
                  <div className="flex flex-wrap justify-between gap-2 text-sm text-amber-700">
                    <strong>{comment.userId?.username || 'Unknown user'}</strong>
                    <time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString()}</time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-amber-950">{comment.content}</p>
                </article>
              ))}
            </div>

            {commentPagination && commentPagination.totalPages > 1 && (
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => loadComments(commentPage - 1)}
                  disabled={!commentPagination.hasPrevPage}
                  className="rounded-full border border-amber-300 px-3 py-1 text-amber-900 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-amber-800">Page {commentPage} of {commentPagination.totalPages}</span>
                <button
                  type="button"
                  onClick={() => loadComments(commentPage + 1)}
                  disabled={!commentPagination.hasNextPage}
                  className="rounded-full border border-amber-300 px-3 py-1 text-amber-900 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}

export default PostPage