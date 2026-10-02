import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor.tsx'
import { apiRequest } from '../lib/apiRequest'

function CreatePostPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [caption, setCaption] = useState('')
  const [topics, setTopics] = useState('')
  const [editorContent, setEditorContent] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!summary.trim()) {
      setError('Summary is required')
      return
    }

    if (!editorContent) {
      setError('Post content is required')
      return
    }

    setIsSubmitting(true)

    try {
      const normalizedTopics = topics
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)

      if (normalizedTopics.length > 3) {
        setError('Maximum 3 topics are allowed')
        setIsSubmitting(false)
        return
      }

      const response = await apiRequest.post('/post/createpost', {
        title: title.trim(),
        summary: summary.trim(),
        description: editorContent,
        caption: caption.trim(),
        topics: normalizedTopics
      })

      console.log('Post created:', response.data)
      console.log('Post content:', editorContent)
      
      navigate('/')
    } catch (err: any) {
      console.error('Error creating post:', err)
      setError(err.response?.data?.message || 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 to-amber-100 py-12 px-4 m-2 rounded-4xl">
      <div className="w-3/4 mx-auto">
        <h1 className="display-title text-4xl font-bold text-amber-950 mb-8 text-center w-fit">Create New Post</h1>
        
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-3xl border border-amber-200/70 p-8 shadow-xl shadow-amber-900/10">
          <div className="space-y-6">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-amber-900 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-900 placeholder-amber-500 transition-all"
                placeholder="Enter your post title"
                maxLength={100}
                required
              />
              <p className="mt-1 text-xs text-amber-600">{title.length}/100 characters</p>
            </div>

            {/* Summary Input */}
            <div>
              <label htmlFor="summary" className="block text-sm font-semibold text-amber-900 mb-2">
                Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-900 placeholder-amber-500 transition-all resize-none"
                placeholder="Summarize the post for recommendations and search"
                maxLength={500}
                required
              />
              <p className="mt-1 text-xs text-amber-600">{summary.length}/500 characters</p>
            </div>

            {/* Caption Input */}
            <div>
              <label htmlFor="caption" className="block text-sm font-semibold text-amber-900 mb-2">
                Caption (Optional)
              </label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-900 placeholder-amber-500 transition-all resize-none"
                placeholder="A short summary shown on post cards (optional)"
                maxLength={300}
              />
              <p className="mt-1 text-xs text-amber-600">{caption.length}/300 characters</p>
            </div>

            {/* Topics Input */}
            <div>
              <label htmlFor="topics" className="block text-sm font-semibold text-amber-900 mb-2">
                Topics (Optional, max 3)
              </label>
              <input
                type="text"
                id="topics"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-amber-900 placeholder-amber-500 transition-all"
                placeholder="Enter topics separated by commas (e.g., react, typescript, webdev)"
              />
              <p className="mt-1 text-xs text-amber-600">Separate topics with commas. Maximum 3 topics allowed.</p>
            </div>

            {/* Editor */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-amber-200 rounded-2xl overflow-hidden bg-white">
                <SimpleEditor 
                  onContentChange={setEditorContent}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-amber-600 text-white font-semibold text-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePostPage   