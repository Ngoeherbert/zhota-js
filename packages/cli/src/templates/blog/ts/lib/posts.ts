export type Post = { slug: string; title: string; date: string; excerpt: string; content: string }

const posts = [
  { slug: 'hello-world', title: 'Hello World', date: '2025-01-01', excerpt: 'My first post on LumineJS', content: '<h1>Hello World</h1><p>Welcome to my blog built with <strong>LumineJS</strong>.</p>' },
  { slug: 'getting-started', title: 'Getting Started', date: '2025-01-02', excerpt: 'Build your first LumineJS app', content: '<h1>Getting Started</h1><p>Create pages, layouts, and components with LumineJS.</p>' },
]

export async function getAllPosts(): Promise<Post[]> {
  return posts
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const post = posts.find((item) => item.slug === slug)
  if (!post) throw new Error(`Unknown post: ${slug}`)
  return post
}
