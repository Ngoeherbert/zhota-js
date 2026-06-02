import { Stack, Text } from '@leminejs/widgets'

export function PostHeader({ post }) {
  return <Stack spacing="xs"><Text as="h1" size="4xl" weight="bold">{post.title}</Text><Text color="muted">{post.date}</Text></Stack>
}
