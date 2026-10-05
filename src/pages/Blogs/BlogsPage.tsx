import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogPostsData, blogCategories } from '../../data/blogs'
import type { BlogPost } from '../../data/types'
import { EngineeringGrid } from '../../components/mechanical/EngineeringGrid'
import { TechnicalDivider } from '../../components/mechanical/TechnicalDivider'
import { MechanicalButton } from '../../components/mechanical/MechanicalButton'
import { CursorTarget } from '../../components/interaction/CursorTarget'
import './blogs.css'

export function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null)

  // Keyboard accessibility: Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setReadingPost(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredPosts = useMemo(() => {
    return blogPostsData.filter((post) => {
      const matchesCategory =
        selectedCategory === 'ALL' || post.category === selectedCategory
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        (post.author && post.author.toLowerCase().includes(query)) ||
        (post.tags && post.tags.some((t) => t.toLowerCase().includes(query)))
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  return (
    <div className="blogs-page">
      <EngineeringGrid className="blogs-page__grid" size={40} opacity={0.03} />

      {/* ─── Hero Section ─── */}
      <section className="blogs-hero page-container" aria-labelledby="blogs-hero-title">
        <div className="blogs-hero__content">
          <div>
            <span className="technical-small">ASSOCIATION ARTICLES & FIELD NOTES</span>
            <h1 id="blogs-hero-title" className="page-heading">
              MECHESA <em>STORIES.</em>
            </h1>
            <p className="blogs-hero__desc">
              Articles, project experiences, career insights, and engineering reflections written by students and members of the MechESA community.
            </p>
          </div>
          <div className="blogs-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search articles by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search articles"
            />
          </div>
        </div>
      </section>

      <main className="page-container">
        {/* ─── Controls & Filter Bar ─── */}
        <div className="blogs-controls">
          <div className="blogs-filter-bar" role="group" aria-label="Filter stories by category">
            {blogCategories.map((category) => {
              const count =
                category === 'ALL'
                  ? blogPostsData.length
                  : blogPostsData.filter((p) => p.category === category).length
              return (
                <button
                  key={category}
                  type="button"
                  className={`blogs-filter-btn${selectedCategory === category ? ' is-active' : ''}`}
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                  <span>{count}</span>
                </button>
              )
            })}
          </div>

          <span className="technical-small" style={{ color: 'var(--color-text-dim)' }}>
            SHOWING {filteredPosts.length} OF {blogPostsData.length} STORIES
          </span>
        </div>

        {/* ─── Stories Grid ─── */}
        {filteredPosts.length > 0 ? (
          <div className="blogs-grid">
            {filteredPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                onRead={() => setReadingPost(post)}
              />
            ))}
          </div>
        ) : (
          <div className="events-empty">
            <p>NO STORIES FOUND MATCHING YOUR SELECTION.</p>
          </div>
        )}

        {/* ─── Career Field Notes Spotlight ─── */}
        <section className="career-tracks-section" aria-labelledby="tracks-title">
          <TechnicalDivider label="CAREER TRACKS" />
          <div style={{ marginTop: '2rem' }}>
            <span className="page-eyebrow">FIELD GUIDANCE</span>
            <h2 id="tracks-title" className="section-heading">CAREER EXPERIENCES.</h2>
            <p className="section-description">
              First-hand advice and lessons learned through internships and campus recruitment from senior students.
            </p>
          </div>

          <div className="career-tracks-grid">
            <article className="career-track-card">
              <span className="technical-small" style={{ color: 'var(--color-accent)' }}>
                TRACK 01 // PLACEMENTS
              </span>
              <h3>PLACEMENT STORIES</h3>
              <p>
                First-hand reflections on preparing for recruitment, navigating technical evaluations, and stepping into the engineering industry.
              </p>
              <div className="career-track-card__footer">
                <span className="technical-small" style={{ color: 'var(--color-text-dim)' }}>
                  CAREER TRANSITIONS
                </span>
                <Link to="/blogs/placements" className="mechanical-button mechanical-button--primary label">
                  <span>EXPLORE PLACEMENTS</span> <span className="btn-arrow" aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>

            <article className="career-track-card">
              <span className="technical-small" style={{ color: 'var(--color-accent)' }}>
                TRACK 02 // INTERNSHIPS
              </span>
              <h3>INTERNSHIP STORIES</h3>
              <p>
                Notes on finding opportunities, joining industry and research teams, and applying classroom fundamentals to real projects.
              </p>
              <div className="career-track-card__footer">
                <span className="technical-small" style={{ color: 'var(--color-text-dim)' }}>
                  STUDENT FIELD NOTES
                </span>
                <Link to="/blogs/internships" className="mechanical-button mechanical-button--primary label">
                  <span>EXPLORE INTERNSHIPS</span> <span className="btn-arrow" aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* ─── Contribute Section ─── */}
        <section className="blogs-contribute-section" aria-labelledby="contribute-title">
          <div>
            <span className="page-eyebrow">CONTRIBUTE TO MECHESA</span>
            <h2 id="contribute-title">HAVE A STORY OR PROJECT NOTE TO SHARE?</h2>
            <p>
              Whether it is a technical discovery, a workshop recap, or an internship experience, your perspective helps other students learn.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
            <CursorTarget intent="link" label="CONNECT">
              <Link className="mechanical-button mechanical-button--primary label" to="/contact">
                <span>SUBMIT YOUR ARTICLE</span> <span className="btn-arrow" aria-hidden="true">↗</span>
              </Link>
            </CursorTarget>
            <span className="technical-small" style={{ color: 'var(--color-text-dim)' }}>
              Open to all IIT Indore mechanical students.
            </span>
          </div>
        </section>
      </main>

      {/* ─── Article Reader Modal ─── */}
      {readingPost && (
        <ArticleReaderModal
          post={readingPost}
          onClose={() => setReadingPost(null)}
        />
      )}
    </div>
  )
}

function BlogCard({
  post,
  onRead,
}: {
  post: BlogPost
  onRead: () => void
}) {
  return (
    <article className="blog-card">
      <div className="blog-card__media">
        <div className="blog-card__media-pattern" />
        <span className="blog-card__badge">{post.category || 'ARTICLE'}</span>
        <div className="blog-card__icon-wrap" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M10 6 H30 V34 H10 Z" />
            <line x1="14" y1="12" x2="26" y2="12" />
            <line x1="14" y1="17" x2="26" y2="17" />
            <line x1="14" y1="22" x2="22" y2="22" />
          </svg>
        </div>
        <span className="blog-card__read-time">{post.readTime || '3 MIN'}</span>
      </div>

      <div className="blog-card__body">
        <div className="blog-card__meta-line">
          <span>{post.date}</span>
          <span>•</span>
          <span>BY {post.author}</span>
        </div>

        <h3 className="blog-card__title">{post.title}</h3>
        <p className="blog-card__excerpt">{post.excerpt}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="blog-card__tags">
            {post.tags.map((tag) => (
              <span key={tag} className="blog-card__tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="blog-card__action">
          {post.trackLink ? (
            <Link to={post.trackLink} className="mechanical-button mechanical-button--primary label">
              <span>OPEN TRACK</span> <span className="btn-arrow" aria-hidden="true">↗</span>
            </Link>
          ) : (
            <MechanicalButton variant="secondary" onClick={onRead}>
              READ STORY →
            </MechanicalButton>
          )}
        </div>
      </div>
    </article>
  )
}

function ArticleReaderModal({
  post,
  onClose,
}: {
  post: BlogPost
  onClose: () => void
}) {
  return (
    <div
      className="article-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
      onClick={onClose}
    >
      <div className="article-modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="article-modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="page-eyebrow" style={{ marginBottom: 0 }}>
              MECHESA ARTICLE
            </span>
            <SystemIndicator state="online" label={post.category || 'ARTICLE'} />
          </div>
          <button
            type="button"
            className="event-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ESC / CLOSE ✕
          </button>
        </header>

        <div className="article-modal-body">
          <h2 id="article-modal-title" className="article-modal-title">
            {post.title}
          </h2>

          <div className="article-modal-meta">
            <span>BY {post.author}</span>
            <span>•</span>
            <span>DATE: {post.date}</span>
            <span>•</span>
            <span>READ TIME: {post.readTime || '3 MIN'}</span>
          </div>

          <div className="article-modal-content">
            <p style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              {post.excerpt}
            </p>
            <p>{post.content || 'Content will be published in the upcoming release cycle.'}</p>
          </div>

          {post.tags && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              {post.tags.map((t) => (
                <span key={t} className="blog-card__tag">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        <footer className="article-modal-foot">
          <MechanicalButton variant="secondary" onClick={onClose}>
            CLOSE
          </MechanicalButton>
        </footer>
      </div>
    </div>
  )
}
