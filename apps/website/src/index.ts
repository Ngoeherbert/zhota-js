
type DocSection = {
  title: string
  summary: string
  links: string[]
}

const sections: DocSection[] = [
  {
    title: 'Getting Started',
    summary: 'Install LumineJS, create a project, and learn the app directory structure.',
    links: ['Introduction', 'Installation', 'Quick Start', 'Project Structure'],
  },
  {
    title: 'Core Concepts',
    summary: 'Understand JSX components, fine-grained signals, effects, memos, refs, and context.',
    links: ['Components', 'useSignal', 'useEffect', 'useMemo', 'useRef', 'useContext'],
  },
  {
    title: 'Full-Stack Features',
    summary: 'Use file-system routing, data loading, API routes, middleware, and server actions.',
    links: ['Routing', 'Data Fetching', 'API Routes', 'Server Actions', 'Middleware'],
  },
  {
    title: 'Optimizations',
    summary: 'Ship optimized images, fonts, route chunks, design tokens, and rendering strategies.',
    links: ['SSR', 'SSG', 'ISR', 'CSR', 'Image', 'Font', 'Code Splitting'],
  },
]

const root = document.querySelector<HTMLDivElement>('#site')

function feature(title: string, body: string): string {
  return `<article class="feature"><h3>${title}</h3><p>${body}</p></article>`
}

function render(): void {
  if (!root) return
  root.innerHTML = `
    <style>${styles}</style>
    <header>
      <a class="logo" href="#top">LumineJS</a>
      <nav>
        <a href="#docs">Docs</a>
        <a href="#api">API</a>
        <a href="#showcase">Showcase</a>
        <a class="pill" href="../demo/">Open demo</a>
      </nav>
    </header>
    <main id="top">
      <section class="hero">
        <p class="eyebrow">React UI + Next-style full-stack + Flutter-inspired widgets</p>
        <h1>One JSX framework. Everything included.</h1>
        <p>
          LumineJS provides fine-grained reactivity, file-system routing, SSR/SSG/ISR/CSR,
          API routes, server actions, built-in widgets, and automatic optimizations in one monorepo.
        </p>
        <pre><code>pnpm create lumine my-app\ncd my-app\npnpm dev</code></pre>
      </section>
      <section class="features">
        ${feature('Fine-grained runtime', 'Signals update exactly the text, attributes, and effects that read them.')}
        ${feature('Rendering per route', 'Choose server, static, revalidated static, or client rendering at page level.')}
        ${feature('Full-stack by default', 'API routes, middleware, server actions, and revalidation live in the app directory.')}
        ${feature('Widgets included', 'Build products without adding a separate component framework.')}
      </section>
      <section id="docs" class="docs">
        <div>
          <p class="eyebrow">Documentation</p>
          <h2>Complete docs map</h2>
          <p>These sections mirror the planned LumineJS docs IA and are ready to be expanded into file-system routes.</p>
        </div>
        <div class="doc-grid">
          ${sections.map((section) => `
            <article class="doc-card">
              <h3>${section.title}</h3>
              <p>${section.summary}</p>
              <ul>${section.links.map((link) => `<li>${link}</li>`).join('')}</ul>
            </article>
          `).join('')}
        </div>
      </section>
      <section id="api" class="band">
        <p class="eyebrow">API Reference</p>
        <h2>Runtime, Router, Server, Compiler, Image, CLI, Vite Plugin, Widgets</h2>
        <p>Each package now has concrete exports, and future docs pages can render typed API tables from those exports.</p>
      </section>
      <section id="showcase" class="band accent">
        <p class="eyebrow">Showcase</p>
        <h2>DevBlog demo app</h2>
        <p>The demo app in this workspace is runnable through Vite and demonstrates the intended end-to-end product shape.</p>
      </section>
    </main>
  `
}

const styles = `
  :root { --bg: #080b18; --panel: #111827; --text: #f9fafb; --muted: #b7c0d1; --primary: #8b85ff; --border: #28324a; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  * { box-sizing: border-box; } html { scroll-behavior: smooth; } body { margin: 0; color: var(--text); background: radial-gradient(circle at top left, #312e81, transparent 30rem), var(--bg); } a { color: inherit; }
  header { position: sticky; top: 0; display: flex; align-items: center; gap: 24px; padding: 18px max(20px, calc((100vw - 1180px) / 2)); background: rgb(8 11 24 / .78); border-bottom: 1px solid var(--border); backdrop-filter: blur(14px); z-index: 5; }
  .logo { font-weight: 900; text-decoration: none; font-size: 1.3rem; } nav { margin-left: auto; display: flex; gap: 14px; align-items: center; flex-wrap: wrap; } nav a { text-decoration: none; color: var(--muted); } .pill { border: 1px solid var(--border); border-radius: 999px; padding: 9px 13px; color: var(--text); }
  main { width: min(1180px, calc(100% - 32px)); margin: 0 auto 64px; } .hero { padding: 96px 0 56px; } .hero h1 { max-width: 960px; font-size: clamp(3rem, 9vw, 7rem); line-height: .9; letter-spacing: -.08em; margin: 0 0 24px; } .hero p { max-width: 780px; color: var(--muted); font-size: 1.25rem; }
  .eyebrow { color: var(--primary); text-transform: uppercase; font-weight: 900; letter-spacing: .14em; font-size: .78rem; } pre { width: min(520px, 100%); background: #020617; border: 1px solid var(--border); border-radius: 22px; padding: 20px; overflow: auto; }
  .features, .doc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; } .feature, .doc-card, .band { background: rgb(17 24 39 / .82); border: 1px solid var(--border); border-radius: 28px; padding: 24px; box-shadow: 0 24px 70px rgb(0 0 0 / .22); }
  .docs { display: grid; grid-template-columns: minmax(220px, 320px) 1fr; gap: 32px; margin-top: 72px; } .doc-card p, .band p, .feature p { color: var(--muted); } li { margin: 8px 0; color: var(--muted); } .band { margin-top: 24px; } .band h2 { font-size: clamp(2rem, 5vw, 4rem); margin: 0 0 16px; } .accent { background: linear-gradient(135deg, rgb(99 91 255 / .38), rgb(17 24 39 / .88)); }
  @media (max-width: 760px) { .docs { grid-template-columns: 1fr; } }
`

render()

// Application entrypoint placeholder. Future tasks will replace this with a LumineJS app.
export {}

