
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/apiRequest'
import { useAuth } from '../context/authContext'

function CreatePostPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [topicsInput, setTopicsInput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const auth = useAuth() as { user?: { username?: string } } | null
  const user = auth?.user

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    if (!title.trim() || !description.trim()) {
      setError('Both title and description are required.')
      setIsSubmitting(false)
      return
    }

    const normalizedTopics = topicsInput
      .split(',')
      .map((topic) => topic.trim().toLowerCase())
      .filter(Boolean)

    const uniqueTopics = [...new Set(normalizedTopics)]

    if (uniqueTopics.length > 3) {
      setError('You can add at most 3 topics.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await apiRequest.post('/post/createpost', {
        title: title.trim(),
        description: description.trim(),
        topics: uniqueTopics,
      })

      setSuccess(response.data.message || 'Post created successfully.')
      setTitle('')
      setDescription('')
      setTopicsInput('')

      setTimeout(() => {
        navigate('/')
      }, 800)
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to create post.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="rise-in w-full max-w-3xl overflow-hidden rounded-3xl border border-amber-200/70 bg-amber-50/90 shadow-2xl shadow-amber-900/15">
        <div className="border-b border-amber-200 bg-linear-to-r from-orange-100 to-amber-200 px-6 py-5">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-800">Write a tech blog</p>
          <h1 className="display-title mt-2 text-4xl italic text-amber-950">Publish your next engineering idea</h1>
          <p className="mt-2 text-amber-900">
            Share a practical walkthrough or insight for your audience.
          </p>
        </div>

        <form className="flex flex-col gap-5 bg-amber-50/75 p-6" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-amber-900">Title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: Understanding React Server Components"
              className="rounded-2xl border border-amber-300 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-amber-900">Article body</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Explain your solution, code decisions, trade-offs, and takeaways..."
              rows={8}
              className="resize-none rounded-2xl border border-amber-300 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-amber-900">Topics (max 3, comma separated)</span>
            <input
              type="text"
              value={topicsInput}
              onChange={(event) => setTopicsInput(event.target.value.toLowerCase())}
              placeholder="Example: react, nodejs, testing"
              className="rounded-2xl border border-amber-300 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="pressable flex cursor-pointer items-center gap-2 rounded-full bg-amber-800 px-6 py-3 font-semibold text-amber-50 shadow-lg shadow-orange-300/45 transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting && <span className="loading-dot" />}
              {isSubmitting ? 'Publishing...' : 'Publish article'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="pressable cursor-pointer rounded-full border border-amber-300 bg-amber-50 px-6 py-3 text-amber-900 transition hover:bg-orange-100"
            >
              Cancel
            </button>
          </div>

          {error && <p className="rounded-2xl bg-red-100 px-4 py-3 text-red-700">{error}</p>}
          {success && <p className="rounded-2xl bg-green-100 px-4 py-3 text-green-700">{success}</p>}
        </form>
      </div>
    </div>
  )
}

export default CreatePostPage