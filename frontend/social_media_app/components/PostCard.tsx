import { Eye, Heart, MessageCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface PostCardProps {
  _id: string
  title: string
  description: unknown
  caption?: string
  author: string
  authorId?: string
  likesCount: number
  commentsCount?: number
  viewsCount?: number
  topics?: string[]
  onOpenPost: () => void
}

function PostCard(props: PostCardProps) {
  const navigate = useNavigate()
  return (
    <article
      className="rise-in flex cursor-pointer flex-col gap-4 rounded-3xl border border-amber-200/70 bg-amber-50/90 p-5 shadow-xl shadow-amber-900/10 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-900/20"
      onClick={props.onOpenPost}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          props.onOpenPost()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open post ${props.title}`}
    >

      <div className="flex items-center rounded-2xl bg-amber-100/85 px-4 py-3 shadow-md shadow-amber-900/10">
        <div className="w-full flex flex-col gap-3">
          <h1 className="display-title text-2xl font-semibold text-amber-950">{props.title}</h1>
          <button
            type="button"
            className="w-fit cursor-pointer rounded-lg border border-orange-200 bg-orange-100 px-2 italic text-amber-900 shadow-sm"
            onClick={(event) => {
              event.stopPropagation()
              if (props.authorId) {
                navigate(`/user/${props.authorId}`)
              }
            }}
            disabled={!props.authorId}
          >
            {props.author}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-orange-50 p-4">
        <p className="text-sm uppercase tracking-[0.2em] text-amber-700">Tech Note</p>
        <p className="mt-2 text-sm leading-6 text-amber-900">{props.caption || 'No caption added.'}</p>

        {!!props.topics?.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {props.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-orange-200 bg-orange-100 px-2 py-1 text-xs font-semibold text-amber-900"
              >
                #{topic}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-amber-200 pt-3 text-sm font-semibold text-amber-900">
        <Heart className="text-orange-500" fill="currentColor" />
        <span>{props.likesCount || 0} {props.likesCount === 1 ? 'like' : 'likes'}</span>
        <MessageCircle className="ml-3 text-amber-700" />
        <span>{props.commentsCount || 0}</span>
        <Eye className="ml-3 text-amber-700" />
        <span>{props.viewsCount || 0} reads</span>
      </div>
    </article>
  )
}

export default PostCard