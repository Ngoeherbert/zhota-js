const posts = [
  { slug: 'hello-world', title: 'Hello World', date: '2025-01-01', excerpt: 'My first post on LemineJS', content: '<h1>Hello World</h1><p>Welcome to my blog built with <strong>LemineJS</strong>.</p>' },
  { slug: 'getting-started', title: 'Getting Started', date: '2025-01-02', excerpt: 'Build your first LemineJS app', content: '<h1>Getting Started</h1><p>Create pages, layouts, and components with LemineJS.</p>' },
]

export async function getAllPosts() {
  return posts
}

export async function getPostBySlug(slug) {
  const post = posts.find((item) => item.slug === slug)
  if (!post) throw new Error(`Unknown post: ${slug}`)
  return post
}
