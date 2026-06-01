import { Container, Stack, Text } from '@leminejs/widgets'
import { getPostBySlug, getAllPosts } from '../../../lib/posts'

export const config = { render: 'static', revalidate: 3600 }

export async function getStaticPaths() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ params: { slug: post.slug } }))
}

export async function getData({ params }) {
  return { post: await getPostBySlug(params.slug) }
}

export default function BlogPost({ post }) {
  return (
    <Container size="md" padding="lg">
      <Stack spacing="lg">
        <Text as="h1" size="4xl" weight="bold">{post.title}</Text>
        <Text color="muted">{post.date}</Text>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </Stack>
    </Container>
  )
}
