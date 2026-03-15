import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Taxonomy = Record<
  string,
  {
    label: string
    topics: Record<string, string>
  }
>

type ContentTypes = Record<string, string>

type DocumentItem = {
  id: number
  title: string
  subject: string
  topic: string
  contentType: string
  originalName: string | null
  filePath: string | null
  externalUrl: string | null
  createdAt: string
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const formatDate = (input: string) => {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return input
  }

  return date.toLocaleString('vi-VN')
}

function App() {
  const [taxonomy, setTaxonomy] = useState<Taxonomy>({})
  const [contentTypes, setContentTypes] = useState<ContentTypes>({})
  const [documents, setDocuments] = useState<DocumentItem[]>([])

  const [subject, setSubject] = useState('co')
  const [topic, setTopic] = useState('dong_hoc')
  const [contentType, setContentType] = useState('ly_thuyet')
  const [search, setSearch] = useState('')

  const [title, setTitle] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const loadTaxonomy = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/taxonomy`)
        if (!response.ok) {
          throw new Error('Khong the tai taxonomy')
        }

        const data = (await response.json()) as {
          taxonomy: Taxonomy
          contentTypes: ContentTypes
        }

        setTaxonomy(data.taxonomy)
        setContentTypes(data.contentTypes)

        const firstSubject = Object.keys(data.taxonomy)[0]
        if (!firstSubject) {
          return
        }

        const firstTopic = Object.keys(data.taxonomy[firstSubject].topics)[0]
        const firstContentType = Object.keys(data.contentTypes)[0]

        setSubject(firstSubject)
        setTopic(firstTopic)
        setContentType(firstContentType)
      } catch (loadError) {
        setError('Khong tai duoc danh muc. Hay kiem tra backend.')
        console.error(loadError)
      }
    }

    loadTaxonomy()
  }, [])

  useEffect(() => {
    if (!subject || !topic || !contentType) {
      return
    }

    const controller = new AbortController()

    const loadDocuments = async () => {
      try {
        setLoading(true)

        const params = new URLSearchParams({
          subject,
          topic,
          contentType,
        })

        if (search.trim()) {
          params.set('q', search.trim())
        }

        const response = await fetch(`${API_BASE}/api/documents?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Khong the tai danh sach tai lieu')
        }

        const rows = (await response.json()) as DocumentItem[]
        setDocuments(rows)
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError('Khong tai duoc danh sach tai lieu.')
          console.error(loadError)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadDocuments()
    return () => controller.abort()
  }, [subject, topic, contentType, search])

  const topicsForSubject = useMemo(() => {
    if (!taxonomy[subject]) {
      return {}
    }
    return taxonomy[subject].topics
  }, [subject, taxonomy])

  const resetTopicIfNeeded = (nextSubject: string) => {
    const nextTopics = taxonomy[nextSubject]?.topics ?? {}
    const firstTopic = Object.keys(nextTopics)[0]
    setTopic(firstTopic || '')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!title.trim()) {
      setError('Ten tai lieu la bat buoc.')
      return
    }

    if (!file && !externalUrl.trim()) {
      setError('Hay upload file hoac nhap duong dan tai lieu.')
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('subject', subject)
      formData.append('topic', topic)
      formData.append('contentType', contentType)

      if (externalUrl.trim()) {
        formData.append('externalUrl', externalUrl.trim())
      }

      if (file) {
        formData.append('file', file)
      }

      const response = await fetch(`${API_BASE}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = (await response.json()) as { message?: string }
        throw new Error(data.message || 'Upload that bai')
      }

      setTitle('')
      setExternalUrl('')
      setFile(null)
      setSuccess('Upload thanh cong.')

      const params = new URLSearchParams({
        subject,
        topic,
        contentType,
      })
      const rows = (await (await fetch(`${API_BASE}/api/documents?${params.toString()}`)).json()) as DocumentItem[]
      setDocuments(rows)
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Upload that bai.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-badge">Vat Ly Tai Lieu Hub</p>
        <h1>Quan ly tai lieu day hoc cho giao vien Vat Ly</h1>
        <p className="hero-description">
          Upload theo dung cau truc mon hoc, click de tai nhanh, de tim va de chia se.
        </p>
      </header>

      <main className="main-layout">
        <aside className="sidebar">
          <h2>Danh muc</h2>
          {Object.entries(taxonomy).map(([subjectKey, subjectData]) => (
            <section key={subjectKey} className="subject-block">
              <button
                type="button"
                className={`subject-title ${subject === subjectKey ? 'is-active' : ''}`}
                onClick={() => {
                  setSubject(subjectKey)
                  resetTopicIfNeeded(subjectKey)
                }}
              >
                {subjectData.label}
              </button>

              {subject === subjectKey && (
                <div className="topic-list">
                  {Object.entries(subjectData.topics).map(([topicKey, topicLabel]) => (
                    <button
                      type="button"
                      key={topicKey}
                      className={`topic-btn ${topic === topicKey ? 'is-active' : ''}`}
                      onClick={() => setTopic(topicKey)}
                    >
                      {topicLabel}
                    </button>
                  ))}
                </div>
              )}
            </section>
          ))}
        </aside>

        <section className="content">
          <div className="filters">
            <div className="tabs">
              {Object.entries(contentTypes).map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  className={`tab-btn ${contentType === key ? 'is-active' : ''}`}
                  onClick={() => setContentType(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              className="search-input"
              placeholder="Tim theo ten tai lieu..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <section className="upload-card">
            <h3>Them tai lieu moi</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-fields">
                <label>
                  Ten tai lieu
                  <input value={title} onChange={(event) => setTitle(event.target.value)} required />
                </label>

                <label>
                  Mon hoc
                  <select
                    value={subject}
                    onChange={(event) => {
                      const nextSubject = event.target.value
                      setSubject(nextSubject)
                      resetTopicIfNeeded(nextSubject)
                    }}
                  >
                    {Object.entries(taxonomy).map(([subjectKey, subjectData]) => (
                      <option key={subjectKey} value={subjectKey}>
                        {subjectData.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Phan
                  <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                    {Object.entries(topicsForSubject).map(([topicKey, topicLabel]) => (
                      <option key={topicKey} value={topicKey}>
                        {topicLabel}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Loai
                  <select value={contentType} onChange={(event) => setContentType(event.target.value)}>
                    {Object.entries(contentTypes).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Upload file
                  <input
                    type="file"
                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                  />
                </label>

                <label>
                  Hoac duong dan tai lieu
                  <input
                    type="url"
                    placeholder="https://..."
                    value={externalUrl}
                    onChange={(event) => setExternalUrl(event.target.value)}
                  />
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Dang upload...' : 'Upload tai lieu'}
              </button>
            </form>
          </section>

          {error && <p className="feedback error">{error}</p>}
          {success && <p className="feedback success">{success}</p>}

          <section className="list-card">
            <h3>Danh sach tai lieu</h3>
            {loading ? (
              <p>Dang tai du lieu...</p>
            ) : documents.length === 0 ? (
              <p>Chua co tai lieu trong muc nay.</p>
            ) : (
              <ul className="document-list">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <div>
                      <p className="doc-title">{doc.title}</p>
                      <p className="doc-meta">Cap nhat: {formatDate(doc.createdAt)}</p>
                    </div>
                    <a href={`${API_BASE}/api/documents/${doc.id}/download`} className="download-link">
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      </main>
    </div>
  )
}

export default App
