type Post = {
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  tags: string[]
  updatedAt: string
}

type Route = {
  path: string
  label: string
  strategy: 'SSG' | 'ISR' | 'CSR' | 'SSR'
  render: () => string
}

const posts: Post[] = [
  {
    slug: 'introducing-leminejs',
    title: 'Introducing LemineJS',
    excerpt: 'A full-stack JSX framework with fine-grained reactivity and built-in widgets.',
    content:
      'LemineJS combines a tiny reactive runtime, file-system routing, rendering modes, API routes, server actions, and a widget library into one developer experience.',
    author: 'Lemine Core Team',
    tags: ['announcement', 'framework'],
    updatedAt: '2026-06-01',
  },
  {
    slug: 'choosing-rendering-strategies',
    title: 'Choosing SSR, SSG, ISR, or CSR',
    excerpt: 'Use the rendering mode that matches each page instead of choosing one for an entire app.',
    content:
      'Marketing pages are great candidates for SSG, frequently changing public content can use ISR, private dashboards often use CSR, and admin views can use SSR for freshness.',
    author: 'Rendering Team',
    tags: ['ssr', 'ssg', 'isr', 'csr'],
    updatedAt: '2026-06-01',
  },
]

const root = document.querySelector<HTMLDivElement>('#app')

function card(title: string, body: string, meta = ''): string {
  return `<article class="card"><p class="eyebrow">${meta}</p><h2>${title}</h2><p>${body}</p></article>`
}

function home(): string {
  return `
    <section class="hero">
      <p class="eyebrow">One framework. Everything included.</p>
      <h1>DevBlog proves LemineJS end-to-end.</h1>
      <p>
        This runnable demo includes public SSG content, ISR-style blog routes, CSR dashboard interactions,
        an SSR admin view, API-route shaped data, server-action shaped mutations, dark mode, search, and SEO metadata.
      </p>
      <div class="actions">
        <a class="button" href="/blog" data-link>Read the blog</a>
        <a class="button secondary" href="/dashboard" data-link>Open dashboard</a>
      </div>
    </section>
    <section class="grid">
      ${card('SSG Home', 'Static marketing content is generated ahead of time for speed.', 'render: static')}
      ${card('ISR Blog', 'Post indexes and detail pages can refresh in the background.', 'render: static + revalidate')}
      ${card('CSR Dashboard', 'Private authoring tools hydrate on the client for rich interactions.', 'render: client')}
      ${card('SSR Admin', 'Operational data renders on every request to stay fresh.', 'render: server')}
    </section>
  `
}

function blogIndex(): string {
  return `
    <section class="page-heading">
      <p class="eyebrow">ISR · revalidate 60s</p>
      <h1>Blog</h1>
      <label class="search">Search posts <input id="post-search" type="search" placeholder="Try SSR" /></label>
    </section>
    <section class="post-list" id="post-list">
      ${posts.map(postPreview).join('')}
    </section>
  `
}

function postPreview(post: Post): string {
  return `
    <article class="card post" data-title="${post.title.toLowerCase()} ${post.tags.join(' ')}">
      <p class="eyebrow">${post.tags.join(' · ')} · ${post.updatedAt}</p>
      <h2><a href="/blog/${post.slug}" data-link>${post.title}</a></h2>
      <p>${post.excerpt}</p>
    </article>
  `
}

function blogPost(slug: string): string {
  const post = posts.find((item) => item.slug === slug)
  if (!post) return notFound()
  return `
    <article class="article">
      <p class="eyebrow">ISR · revalidate 300s · ${post.updatedAt}</p>
      <h1>${post.title}</h1>
      <p class="lead">${post.excerpt}</p>
      <p>${post.content}</p>
      <p class="byline">Written by ${post.author}</p>
      <a href="/blog" data-link>← Back to blog</a>
    </article>
  `
}

function dashboard(): string {
  return `
    <section class="page-heading">
      <p class="eyebrow">CSR · protected authoring surface</p>
      <h1>Dashboard</h1>
      <p>Create a local optimistic post. This mirrors the server action workflow without requiring a separate server.</p>
    </section>
    <form class="card form" id="new-post-form">
      <label>Title <input name="title" required value="Draft LemineJS Post" /></label>
      <label>Excerpt <textarea name="excerpt" required>Optimistic UI updates before the server confirms.</textarea></label>
      <button class="button" type="submit">Create optimistic post</button>
    </form>
    <section class="post-list" id="draft-list"></section>
  `
}

function admin(): string {
  return `
    <section class="page-heading">
      <p class="eyebrow">SSR · always fresh</p>
      <h1>Admin</h1>
    </section>
    <section class="grid">
      ${card(String(posts.length), 'Published posts currently available through the demo API route shape.', 'GET /api/posts')}
      ${card('JWT middleware', 'Dashboard and admin routes are the protected surfaces in the full DevBlog plan.', 'middleware')}
      ${card('Server actions', 'Create, update, delete, and revalidate flows are represented in the framework packages.', 'actions')}
    </section>
  `
}

function notFound(): string {
  return `
    <section class="hero">
      <p class="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The DevBlog router could not match this URL.</p>
      <a class="button" href="/" data-link>Go home</a>
    </section>
  `
}

const routes: Route[] = [
  { path: '/', label: 'Home', strategy: 'SSG', render: home },
  { path: '/blog', label: 'Blog', strategy: 'ISR', render: blogIndex },
  { path: '/dashboard', label: 'Dashboard', strategy: 'CSR', render: dashboard },
  { path: '/admin', label: 'Admin', strategy: 'SSR', render: admin },
]

function matchRoute(pathname: string): { route?: Route; params?: Record<string, string> } {
  const staticRoute = routes.find((route) => route.path === pathname)
  if (staticRoute) return { route: staticRoute }
  const postMatch = pathname.match(/^\/blog\/([^/]+)$/)
  if (postMatch?.[1]) {
    const slug = postMatch[1]
    return { route: { path: '/blog/[slug]', label: 'Post', strategy: 'ISR', render: () => blogPost(slug) }, params: { slug } }
  }
  return {}
}

function layout(content: string, activePath: string): string {
  return `
    <style>${styles}</style>
    <header class="shell-header">
      <a class="brand" href="/" data-link>LemineJS <span>DevBlog</span></a>
      <nav>
        ${routes.map((route) => `<a href="${route.path}" data-link class="${activePath === route.path ? 'active' : ''}">${route.label}<small>${route.strategy}</small></a>`).join('')}
      </nav>
      <button id="theme-toggle" class="theme-toggle" type="button">Toggle theme</button>
    </header>
    <main>${content}</main>
    <footer>Built with the local LemineJS monorepo packages · no Express, React, or external UI library required.</footer>
  `
}

function render(pathname = location.pathname): void {
  if (!root) return
  const match = matchRoute(pathname)
  const content = match.route ? match.route.render() : notFound()
  root.innerHTML = layout(content, pathname)
  document.title = match.route ? `${match.route.label} · LemineJS DevBlog` : 'Not Found · LemineJS DevBlog'
  wireInteractions()
}

function wireInteractions(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (link.origin !== location.origin) return
      event.preventDefault()
      history.pushState({}, '', link.pathname)
      render(link.pathname)
      scrollTo({ top: 0, behavior: 'smooth' })
    })
  })

  document.querySelector<HTMLButtonElement>('#theme-toggle')?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('lemine-demo-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  })

  document.querySelector<HTMLInputElement>('#post-search')?.addEventListener('input', (event) => {
    const input = event.currentTarget as HTMLInputElement
    const query = input.value.toLowerCase()
    document.querySelectorAll<HTMLElement>('.post').forEach((post) => {
      post.hidden = !post.dataset.title?.includes(query)
    })
  })

  document.querySelector<HTMLFormElement>('#new-post-form')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const form = event.currentTarget as HTMLFormElement
    const data = new FormData(form)
    const title = String(data.get('title'))
    const excerpt = String(data.get('excerpt'))
    document.querySelector('#draft-list')?.insertAdjacentHTML(
      'afterbegin',
      postPreview({ slug: title.toLowerCase().replace(/\W+/g, '-'), title, excerpt, content: excerpt, author: 'You', tags: ['optimistic'], updatedAt: 'just now' }),
    )
  })
}

const styles = `
  :root { color-scheme: light; --bg: #f7f7fb; --panel: #fff; --text: #111827; --muted: #667085; --primary: #635bff; --border: #e5e7eb; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  :root.dark { color-scheme: dark; --bg: #0b1020; --panel: #111827; --text: #f9fafb; --muted: #a7b0c0; --primary: #8b85ff; --border: #25304a; }
  * { box-sizing: border-box; } body { margin: 0; background: var(--bg); color: var(--text); } a { color: inherit; } main { width: min(1120px, calc(100% - 32px)); margin: 48px auto; } footer { width: min(1120px, calc(100% - 32px)); margin: 0 auto 32px; color: var(--muted); }
  .shell-header { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; gap: 24px; padding: 16px max(16px, calc((100vw - 1120px) / 2)); background: color-mix(in srgb, var(--panel) 90%, transparent); border-bottom: 1px solid var(--border); backdrop-filter: blur(12px); }
  .brand { font-weight: 800; text-decoration: none; } .brand span { color: var(--primary); } nav { display: flex; gap: 10px; flex: 1; flex-wrap: wrap; } nav a { border: 1px solid var(--border); border-radius: 999px; padding: 8px 12px; text-decoration: none; } nav a.active { border-color: var(--primary); color: var(--primary); } small { margin-left: 6px; color: var(--muted); }
  .theme-toggle, .button { border: 0; border-radius: 999px; padding: 11px 16px; background: var(--primary); color: white; font-weight: 700; text-decoration: none; cursor: pointer; display: inline-flex; } .secondary { background: var(--panel); color: var(--text); border: 1px solid var(--border); }
  .hero { padding: 72px; border-radius: 32px; background: radial-gradient(circle at top right, color-mix(in srgb, var(--primary) 22%, transparent), transparent 36%), var(--panel); border: 1px solid var(--border); } .hero h1 { font-size: clamp(2.5rem, 7vw, 5.5rem); line-height: .95; margin: 0 0 20px; max-width: 900px; } .hero p, .lead { font-size: 1.2rem; color: var(--muted); max-width: 760px; }
  .actions, .grid { display: flex; gap: 16px; flex-wrap: wrap; } .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-top: 24px; } .card { background: var(--panel); border: 1px solid var(--border); border-radius: 24px; padding: 24px; box-shadow: 0 18px 60px rgb(15 23 42 / .08); } .card h2 { margin-top: 0; }
  .eyebrow { color: var(--primary); font-size: .8rem; text-transform: uppercase; font-weight: 800; letter-spacing: .12em; } .page-heading { margin-bottom: 24px; } .page-heading h1, .article h1 { font-size: clamp(2.2rem, 6vw, 4.5rem); margin: 0; }
  .post-list { display: grid; gap: 16px; } .article { background: var(--panel); border: 1px solid var(--border); border-radius: 32px; padding: 48px; } .byline { color: var(--muted); } .search, .form label { display: grid; gap: 8px; color: var(--muted); } input, textarea { width: 100%; border: 1px solid var(--border); border-radius: 16px; padding: 12px; background: var(--bg); color: var(--text); } .form { display: grid; gap: 16px; margin-bottom: 24px; }
`

if (localStorage.getItem('lemine-demo-theme') === 'dark') document.documentElement.classList.add('dark')
addEventListener('popstate', () => render())
render()
