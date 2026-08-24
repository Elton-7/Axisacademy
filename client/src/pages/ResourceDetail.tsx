import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Calendar, Clock, Loader, User } from 'lucide-react'
import { resourcesApi } from '../services/apiClient'
import { preloadedArticle } from '../content/preloaded'
import { SITE_URL } from '../content/contact'
import type { Resource } from '../types'

/**
 * An article's own page.
 *
 * There wasn't one. Articles carried a slug in the database and the list page
 * had nowhere to send anyone — so nothing could be linked, shared, or indexed,
 * and a search engine had no page to rank. That is the whole of what Axis asks
 * for in section 4 of the Resources review: a searchable title, a description,
 * and a link of its own.
 *
 * So this page carries the full set: a real <title> and meta description, a
 * canonical URL, Open Graph and Twitter cards for when a link is shared, and
 * Article structured data naming the author and the dates — which is what
 * search engines read to decide an article is an article rather than a page.
 */

/** Long dates read better than numerals in a byline. */
const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

/**
 * The body is stored as light markdown — paragraphs, and **bold** lead-ins.
 * Rendered here rather than with a markdown library: the whole vocabulary is
 * two constructs, and a dependency that can execute HTML has no business
 * rendering text an author pasted in.
 */
function ArticleBody({ content }: { content: string }) {
  return (
    <>
      {content
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block, index) => {
          const bold = block.match(/^\*\*(.+?)\*\*\s*(.*)$/s)
          if (bold) {
            return (
              <p key={index} className="mt-6 leading-relaxed text-ink-muted">
                <strong className="text-ink">{bold[1]}</strong> {bold[2]}
              </p>
            )
          }
          return (
            <p key={index} className="mt-6 leading-relaxed text-ink-muted">
              {block}
            </p>
          )
        })}
    </>
  )
}

export default function ResourceDetail() {
  const { slug } = useParams<{ slug: string }>()
  // Seeded at build time for a prerendered page, so the first render is the
  // finished article rather than a spinner — and the browser hydrates over
  // identical markup instead of replacing it.
  const preloaded = preloadedArticle(slug)
  const [article, setArticle] = useState<Resource | null>(preloaded ?? null)
  const [loading, setLoading] = useState(!preloaded)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!slug || preloaded) return
      setLoading(true)
      setNotFound(false)
      try {
        const found = await resourcesApi.getBySlug(slug)
        if (!cancelled) setArticle(found)
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-20">
        <Loader className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }

  if (notFound || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-32 text-center sm:px-6 lg:px-8">
        <Helmet>
          <title>Article not found · Axis Learning</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <h1 className="text-3xl font-semibold text-ink">We could not find that article.</h1>
        <p className="mt-4 text-ink-muted">
          It may have been moved, or the link may be incomplete.
        </p>
        <Link to="/resources" className="btn-primary mt-8 inline-flex">
          Browse all articles
        </Link>
      </div>
    )
  }

  const canonical = `${SITE_URL}/resources/${article.slug}`
  const description = article.metaDescription || article.excerpt || ''

  return (
    <div className="pt-20">
      <Helmet>
        <title>{`${article.title} · Axis Learning`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        {article.coverImage && <meta property="og:image" content={`${SITE_URL}${article.coverImage}`} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={description} />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description,
            articleSection: article.category,
            author: { '@type': 'Person', name: article.author },
            publisher: {
              '@type': 'Organization',
              name: 'Axis Learning',
              url: SITE_URL,
            },
            datePublished: article.publishedAt,
            dateModified: article.updatedAt || article.publishedAt,
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
            ...(article.coverImage ? { image: `${SITE_URL}${article.coverImage}` } : {}),
          })}
        </script>
      </Helmet>

      <article>
        <header className="bg-navy py-16 text-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link
              to="/resources"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-gold-500"
            >
              <ArrowLeft className="h-4 w-4" />
              All articles
            </Link>

            <p className="section-label text-gold-500">{article.category}</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{article.title}</h1>

            {article.excerpt && (
              <p className="mt-5 text-lg leading-relaxed text-white/75">{article.excerpt}</p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
              <span className="inline-flex items-center gap-2">
                <User className="h-4 w-4 text-gold-500" aria-hidden="true" />
                {article.author}
              </span>
              {article.publishedAt && (
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gold-500" aria-hidden="true" />
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                </span>
              )}
              {article.readTime && (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gold-500" aria-hidden="true" />
                  {article.readTime}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="bg-surface py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {article.content && <ArticleBody content={article.content} />}

            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2 border-t border-line pt-8">
                {article.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface-sunk px-3 py-1 text-xs text-ink-muted">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-12 rounded-2xl border border-line bg-surface-sunk p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-ink">Thinking about your own learner?</h2>
              <p className="mt-2 leading-relaxed text-ink-muted">
                Most families start with a conversation rather than a decision. Tell us about the
                learner and we will take it from there.
              </p>
              <Link to="/enroll" className="btn-primary mt-5 inline-flex">
                Start with an enquiry
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
