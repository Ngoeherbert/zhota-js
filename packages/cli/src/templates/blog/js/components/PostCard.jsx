import { Card, Stack, Text, Button } from '@leminejs/widgets'

export function PostCard({ post }) {
  return (
    <Card padding="md" shadow="sm">
      <Stack spacing="sm">
        <Text as="h2" size="xl" weight="bold">{post.title}</Text>
        <Text color="muted">{post.excerpt}</Text>
        <Button as="a" href={`/blog/${post.slug}`} variant="ghost">Read more</Button>
      </Stack>
    </Card>
  )
}
