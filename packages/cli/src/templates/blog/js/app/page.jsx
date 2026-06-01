import { Container, Stack, Text, Grid } from '@leminejs/widgets'
import { PostCard } from '../components/PostCard'
import { getAllPosts } from '../lib/posts'

export const config = { render: 'static' }

export async function getData() {
  return { posts: await getAllPosts() }
}

export default function BlogIndex({ posts }) {
  return (
    <Container size="lg" padding="lg">
      <Stack spacing="xl">
        <Text as="h1" size="4xl" weight="bold">Blog</Text>
        <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="md">
          {posts.map((post) => <PostCard key={post.slug} post={post} />)}
        </Grid>
      </Stack>
    </Container>
  )
}
